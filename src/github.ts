import { DynamoDB } from "aws-sdk";
import axios from "axios";
import { Endpoints } from "@octokit/types";
require("dotenv").config();

const dynamoDb = new DynamoDB.DocumentClient();

type ListUserReposResponse =
  Endpoints["GET /repos/{owner}/{repo}"]["response"]["data"];

/**
 * Responsible for fetching the current state of public repositories
 * directly through GitHub's public API, and storing the results in
 * a DynamoDB table.
 *
 * This function is supposed to run on schedule.
 */
module.exports.writeReposToDb = async () => {
  const response = await axios.get<ListUserReposResponse[]>(
    "https://api.github.com/users/PiotrRut/repos?sort=created",
    {
      headers: {
        Authorization: String(process.env.GITHUB_TOKEN),
      },
    }
  );
  response.data
    .filter((r) => r.name !== "PiotrRut" && !r.fork)
    .map(async (r) => {
      const params: DynamoDB.DocumentClient.PutItemInput = {
        TableName: String(process.env.DYNAMODB_TABLE),
        Item: {
          repoName: r.name,
          description: r.description,
          gitUrl: r.html_url,
          repoLanguage: r.language,
          stars: r.stargazers_count,
          forks: r.forks,
          created: r.created_at,
          id: r.id.toString(),
        },
      };
      await dynamoDb.put(params).promise();
    });
};

/**
 * Responsible for returning all items in the "Repos" DynamoDB table,
 * which https://prutkowski.dev will read directly to populate the GH Repos page.
 */
module.exports.getRepos = async () => {
  try {
    const data = await dynamoDb
      .scan({ TableName: String(process.env.DYNAMODB_TABLE) })
      .promise();
    return {
      statusCode: 200,
      body: JSON.stringify(data.Items),
    };
  } catch (error) {
    console.log(error);
  }
};
