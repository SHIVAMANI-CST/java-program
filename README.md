This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Integrate to Github workflows for build notifications

Step 1: Copy the below pre-build and post build in amplify.yml
preBuild:
      commands:
        - npm ci --cache .npm --prefer-offline
        - |
          aws sns publish \
            --topic-arn ${SNS_TOPIC_ARN} \
            --message "Build started for branch ${AWS_BRANCH}" \
            --message-attributes '{
              "buildStatus": {
                "DataType": "String",
                "StringValue": "STARTED"
              },
              "branch": {
                "DataType": "String",
                "StringValue": "'${AWS_BRANCH}'"
              },
              "CommitId": {
                "DataType": "String",
                "StringValue": "'${AWS_COMMIT_ID}'"
              },
              "repoUrl": {
                "DataType": "String",
                "StringValue": "'${AWS_CLONE_URL}'"
              }
            }'
    build:
      commands:
        - npm run build
    postBuild:
      commands:
        - |
          BUILD_STATUS="FAILED"
          if [ $CODEBUILD_BUILD_SUCCEEDING -eq 1 ]; then
            BUILD_STATUS="SUCCESS"
          fi
        - |
          aws sns publish \
            --topic-arn ${SNS_TOPIC_ARN} \
            --message "Build completed for branch ${AWS_BRANCH}" \
            --message-attributes '{
              "buildStatus": {
                "DataType": "String",
                "StringValue": "'${BUILD_STATUS}'"
              },
              "branch": {
                "DataType": "String",
                "StringValue": "'${AWS_BRANCH}'"
              },
              "CommitId": {
                "DataType": "String",
                "StringValue": "'${AWS_COMMIT_ID}'"
              },
              "repoUrl": {
                "DataType": "String",
                "StringValue": "'${AWS_CLONE_URL}'"
              }
            }'
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'

Step2: Configure the github token if not configured in the AWS Secrets Manager with Key as GITHUB_AMPLIFY_DEPLOYMENT_KEY

Step3:
      Configure below environment variables 
      1. GITHUB_SECRET_KEY with value GITHUB_AMPLIFY_DEPLOYMENT_KEY
      2. GITHUB_TOKEN_SECRET_NAME with value of secrets name which was created in step2

## Issues in JIRA Deployment

Under project navigate to deployments to see the status of the deployment
pre commit check