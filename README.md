# Slack Notify Action

Send Notifications to Slack in a GitHub Workflow

![Build](https://img.shields.io/github/workflow/status/gesellix/slack-notify-action/Build?label=build)
![Test](https://img.shields.io/github/workflow/status/gesellix/slack-notify-action/Tests?label=test)
![GitHub release (latest by date)](https://img.shields.io/github/v/release/gesellix/slack-notify-action?color=brightgreen)
![GitHub](https://img.shields.io/github/license/gesellix/slack-notify-action?color=brightgreen)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# ToC

<!-- TOC depthFrom:2 -->

- [Feature](#feature)
- [Inputs](#inputs)
- [Examples](#examples)
    - [Basic usage](#basic-usage)
    - [Includes the latest commit information](#includes-the-latest-commit-information)
- [Slack UI](#slack-ui)
- [LICENSE](#license)

<!-- /TOC -->

## Feature

- Notify the result of GitHub Actions
- Support three job status (reference: [job-context](https://help.github.com/en/articles/contexts-and-expression-syntax-for-github-actions#job-context))
    - success
    - failure
    - cancelled
- Mention
    - Notify message to channel members efficiently
    - You can specify the condition to mention

## Inputs

First of all, you need to set GitHub secrets for SLACK_WEBHOOK that is Incoming Webhook URL.<br>
You can customize the following parameters:

|with parameter|required/optional|default|description|
|:--:|:--:|:--|:--|
|type|required|N/A|The result of GitHub Actions job<br>This parameter value must contain the following word:<br>- `success`<br>- `failure`<br>- `cancelled`<br>We recommend using ${{ job.status }}|
|job_name|required|N/A|Means slack notification title|
|url|required|N/A|Slack Incoming Webhooks URL<br>Please specify this key or SLACK_WEBHOOK environment variable<br>※SLACK_WEBHOOK will be deprecated|
|mention|optional|N/A|Slack message mention|
|mention_if|optional|N/A|The condition to mention<br>This parameter can contain the following word:<br>- `success`<br>- `failure`<br>- `cancelled`<br>- `always`|
|icon_emoji|optional|Use Slack Incoming Webhook configuration|Slack icon|
|username|optional|Use Slack Incoming Webhook configuration|Slack username|
|channel|optional|Use Slack Incoming Webhook configuration|Slack channel name|
|commit|optional|false|If true, slack notification includes the latest commit message and author.|
|token|case by case|N/A|This token is used to get commit data.<br>If commit parameter is true, this parameter is required.<br>${{ secrets.GITHUB_TOKEN }} is recommended.|

Please refer to [action.yml](./action.yml) for more details.

## Examples

### Basic usage

```..github/workflows/example1.yml
- name: Slack Notification
  uses: gesellix/slack-notify-action@main
  if: always()
  with:
    type: ${{ job.status }}
    job_name: '*Test*'
    channel: '#random'
    url: ${{ secrets.SLACK_WEBHOOK }}
```

### Includes the latest commit information

```..github/workflows/example2.yml
- name: Slack Notification
  uses: gesellix/slack-notify-action@main
  if: always()
  with:
    type: ${{ job.status }}
    job_name: '*Lint Check*'
    mention: 'here'
    mention_if: 'failure'
    channel: '#random'
    url: ${{ secrets.SLACK_WEBHOOK }}
    commit: true
    token: ${{ secrets.GITHUB_TOKEN }}
```

## Slack UI

<img src="./images/slack2.png" alt="Notification Preview" width="90%">

---

<img src="./images/slack.png" alt="Notification Preview" width="90%">

## License

[The MIT License (MIT)](https://github.com/gesellix/slack-notify-action/blob/main/LICENSE)

## Credits

Most of the code is based on [gesellix/slatify](https://github.com/gesellix/slatify),
which is a fork of [lazy-actions/slatify](https://github.com/lazy-actions/slatify),
formerly known as [homoluctus/slatify](https://github.com/homoluctus/slatify).

---

<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# Create a JavaScript Action using TypeScript

Use this template to bootstrap the creation of a TypeScript action.:rocket:

This template includes compilation support, tests, a validation workflow, publishing, and versioning guidance.  

If you are new, there's also a simpler introduction.  See the [Hello World JavaScript Action](https://github.com/actions/hello-world-javascript-action)

## Create an action from this template

Click the `Use this Template` and provide the new repo details for your action

## Code in Main

> First, you'll need to have a reasonably modern version of `node` handy. This won't work with versions older than 9, for instance.

Install the dependencies  
```bash
$ npm install
```

Build the typescript and package it for distribution
```bash
$ npm run build && npm run package
```

Run the tests :heavy_check_mark:  
```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)

...
```

## Change action.yml

The action.yml defines the inputs and output for your action.

Update the action.yml with your name, description, inputs and outputs for your action.

See the [documentation](https://help.github.com/en/articles/metadata-syntax-for-github-actions)

## Change the Code

Most toolkit and CI/CD operations involve async operations so the action is run in an async function.

```javascript
import * as core from '@actions/core';
...

async function run() {
  try { 
      ...
  } 
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
```

See the [toolkit documentation](https://github.com/actions/toolkit/blob/master/README.md#packages) for the various packages.

## Publish to a distribution branch

Actions are run from GitHub repos so we will checkin the packed dist folder. 

Then run [ncc](https://github.com/zeit/ncc) and push the results:
```bash
$ npm run package
$ git add dist
$ git commit -a -m "prod dependencies"
$ git push origin releases/v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket: 

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Validate

You can now validate the action by referencing `./` in a workflow in your repo (see [test.yml](.github/workflows/test.yml))

```yaml
uses: ./
with:
  milliseconds: 1000
```

See the [actions tab](https://github.com/actions/typescript-action/actions) for runs of this action! :rocket:

## Usage:

After testing you can [create a v1 tag](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md) to reference the stable and latest V1 action
