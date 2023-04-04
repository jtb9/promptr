import { Configuration, OpenAIApi } from "openai"
import CliState from "./cliState.js";
import ConfigService from "./configService.js"
import { encode } from "gpt-3-encoder"
import axios from 'axios';

async function sendPrompt(promptText) {
  const openAiEndpoint = 'https://api.openai.com/v1/chat/completions';

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
  };

  try {
    const response = await axios.post(
      openAiEndpoint,
      {
        model: 'gpt-4',
        "messages": [{ "role": "user", "content": promptText }],
        temperature: 0.8,
      },
      { headers }
    );

    if (!response?.data?.choices) return null
    let result = response.data.choices.map((d) => d?.message?.content?.trim()).join()
    if (verbose) console.log(`--Response--\n${result}`)
    return result
  } catch (error) {
    console.error('Error sending prompt to GPT-4:', JSON.stringify(error));
    return '';
  }
}


export default class Gpt4Service {
  static async call(prompt) {
    // const configuration = new Configuration({
    //   apiKey: process.env.OPENAI_API_KEY
    // })
    // const verbose = CliState.verbose()
    // const openai = new OpenAIApi(configuration)

    // const config = await ConfigService.retrieveConfig();
    // const encoded = encode(prompt)
    // if (verbose) console.log(`Prompt token count: ${encoded.length}`)
    // const response = await openai.createChatCompletion({
    //   model: "gpt-4",
    //   temperature: config.api.temperature,
    //   messages: [{ role: "user", content: prompt }],
    // });

    // if (!response?.data?.choices) return null
    // let result = response.data.choices.map((d) => d?.message?.content?.trim()).join()
    // if (verbose) console.log(`--Response--\n${result}`)
    // return result
    return await sendPrompt(prompt);
  }

  static extractSourceCode(input) {
    const lines = input.split("\n")
    if (lines.length > 0 && lines[0].startsWith("Updated source code:")) {
      lines.shift()
    }
    if (lines.length > 0 && lines[0].startsWith("// Your code")) {
      lines.shift()
    }
    if (lines.length > 0 && lines[0].startsWith("-------")) {
      lines.shift()
    }
    return lines.join("\n")
  }
}
