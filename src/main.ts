import * as core from '@actions/core'
import * as github from './github'
import {validateStatus, isValidCondition} from './job-status'
import {Slack, SlackOptions} from './slack'

async function run(): Promise<void> {
  try {
    const status = validateStatus(
      core.getInput('type', {required: true}).toLowerCase()
    )
    // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true
    core.debug(`Job status: ${status}`)

    const jobName = core.getInput('job_name', {required: true})
    core.debug(`Job name: ${jobName}`)

    let mention = core.getInput('mention')
    let mentionCondition = core.getInput('mention_if').toLowerCase()
    core.debug(`Mention ${mention}, if '${mentionCondition}'`)

    const slackOptions: SlackOptions = {
      token: process.env.SLACK_TOKEN || core.getInput('slack_token'),
      channel: process.env.SLACK_CHANNEL || core.getInput('channel'),
      username: core.getInput('username'),
      icon_emoji: core.getInput('icon_emoji')
    }
    core.debug(`Slack channel: ${slackOptions.channel}`)
    core.debug(`Slack username: ${slackOptions.username}`)

    const commitFlag = core.getInput('commit') === 'true'
    core.debug(`Include commit info: ${commitFlag}`)

    const gitHubToken = core.getInput('token')

    if (mention && !isValidCondition(mentionCondition)) {
      mention = ''
      mentionCondition = ''
      core.warning(`Ignore slack message mention:
    mention_if: ${mentionCondition} is invalid
    `)
    }

    if (slackOptions.token === '') {
      throw new Error(`Missing Slack Token.
    Please configure "SLACK_TOKEN" as environment variable or
    specify the key called "slack_token" in "with" section.
    `)
    }

    if (slackOptions.channel === '') {
      throw new Error(`Missing Slack Channel.
    Please configure "SLACK_CHANNEL" as environment variable or
    specify the key called "channel" in "with" section.
    `)
    }

    let commit: github.CommitContext | undefined
    if (commitFlag) {
      commit = await github.getCommit(gitHubToken)
    }

    const slack = new Slack(slackOptions)
    const payload = slack.generatePayload(
      slackOptions,
      jobName,
      status,
      mention,
      mentionCondition,
      commit
    )
    core.debug(`Generated payload for slack: ${JSON.stringify(payload)}`)

    await slack.notify(slackOptions.token, payload)
    core.info('Message posted to Slack')
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
