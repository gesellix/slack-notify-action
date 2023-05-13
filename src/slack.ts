import * as core from '@actions/core'
import {context} from '@actions/github'
import {MrkdwnElement} from '@slack/types'
import {ChatPostMessageArguments, ErrorCode, WebClient} from '@slack/web-api'
import * as github from './github'
import {
  CodedError,
  WebAPIFileUploadInvalidArgumentsError,
  WebAPIPlatformError
} from '@slack/web-api/dist/errors'

export interface SlackOptions {
  token: string
  channel: string
  username: string
  icon_emoji: string
}

export class Block {
  readonly status: {
    [name: string]: {
      color: string
      result: string
    }
  } = {
    success: {
      color: '#2cbe4e',
      result: 'Succeeded'
    },
    failure: {
      color: '#cb2431',
      result: 'Failed'
    },
    cancelled: {
      color: '#ffc107',
      result: 'Cancelled'
    }
  }

  jobStatus: string
  commit: github.CommitContext | undefined

  constructor(jobStatus: string, commit: github.CommitContext | undefined) {
    this.jobStatus = jobStatus
    this.commit = commit
  }

  getColor(): string {
    return this.status[this.jobStatus].color
  }

  getResultText(): string {
    return this.status[this.jobStatus].result
  }

  getBaseField(): MrkdwnElement[] {
    const {owner, repo} = context.repo
    const url = github.getWorkflowUrls()
    const eventText = url.event
      ? `<${url.event}|${context.eventName}>`
      : context.eventName
    return [
      {
        type: 'mrkdwn',
        text: `*repository*\n<${url.repo}|${owner}/${repo}>`
      },
      {
        type: 'mrkdwn',
        text: `*ref*\n${context.ref}`
      },
      {
        type: 'mrkdwn',
        text: `*event name*\n${eventText}`
      },
      {
        type: 'mrkdwn',
        text: `*workflow*\n<${url.action}|${context.workflow}>`
      }
    ]
  }

  getCommitField(): MrkdwnElement[] {
    if (this.commit === undefined) {
      return []
    }
    const commitMsg = this.commit.message.split('\n')[0]
    const commitUrl = this.commit.url
    const field: MrkdwnElement[] = [
      {
        type: 'mrkdwn',
        text: `*commit*\n<${commitUrl}|${commitMsg}>`
      }
    ]

    const author = this.commit.author
    if (author) {
      field.push({
        type: 'mrkdwn',
        text: `*author*\n<${author.url}|${author.name}>`
      })
    }

    return field
  }
}

export class Slack {
  slackOptions: SlackOptions

  constructor(slackOptions: SlackOptions) {
    this.slackOptions = slackOptions
  }

  isMention(condition: string, status: string): boolean {
    return condition === 'always' || condition === status
  }

  generatePayload(
    slackOptions: SlackOptions,
    jobName: string,
    status: string,
    mention: string,
    mentionCondition: string,
    commit?: github.CommitContext
  ): ChatPostMessageArguments {
    const block = new Block(status, commit)
    const tmpText = `${jobName} ${block.getResultText()}`
    const text =
      mention && this.isMention(mentionCondition, status)
        ? `<!${mention}> ${tmpText}`
        : tmpText
    const baseBlock = {
      type: 'section',
      fields: block.getBaseField()
    }

    const commitField = block.getCommitField()
    Array.prototype.push.apply(baseBlock.fields, commitField)

    return {
      channel: slackOptions.channel,
      text,
      attachments: [
        {
          color: block.getColor(),
          blocks: [baseBlock]
        }
      ],
      unfurl_links: true
    }
  }

  private isCodedError(err: CodedError | unknown): err is CodedError {
    return (err as CodedError).code !== undefined
  }

  private isWebAPIPlatformError(
    err: WebAPIPlatformError | unknown
  ): err is WebAPIPlatformError {
    return (err as WebAPIPlatformError).data !== undefined
  }

  private isWebAPIFileUploadInvalidArgumentsError(
    err: WebAPIFileUploadInvalidArgumentsError | unknown
  ): err is WebAPIFileUploadInvalidArgumentsError {
    return (err as WebAPIFileUploadInvalidArgumentsError).data !== undefined
  }

  async notify(
    token: string,
    payload: ChatPostMessageArguments
  ): Promise<void> {
    const web = new WebClient(token)
    try {
      const result = await web.chat.postMessage(payload)
      core.info(`Message sent successfully ${result.ts}`)
    } catch (error: unknown) {
      core.error(`An error occurred ${error}`)
      if (this.isCodedError(error)) {
        if (error.code === ErrorCode.PlatformError) {
          core.error((error as WebAPIPlatformError).data.error)
        } else {
          core.error(`Unexpected error code: ${error.code}`)
        }
      } else {
        core.error(`Unexpected error: ${error}`)
      }
      if (
        this.isWebAPIPlatformError(error) ||
        this.isWebAPIFileUploadInvalidArgumentsError(error)
      ) {
        throw new Error(`
      Failed to post message to Slack
      Response: ${error.data}
      `)
      } else {
        throw new Error(`
      Failed to post message to Slack
      Error: ${error}
      `)
      }
    }
  }
}
