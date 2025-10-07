// Import the necessary discord.js classes using ES6 syntax
import { Client, Events, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import * as fs from 'fs';

// Import custom command modules
import * as choochoo from './commands/choochoo.js';
import * as gif from './commands/gif.js';
import * as randomwalk from './commands/randomwalk.js';
import * as roshambo from './commands/roshambo.js';

// Call the config() function on dotenv to load the environmental variables from the .env file
config();

// Load heart count from data.json file and initialize variables
let data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));
let heartCount = data.hearts;
let danChannel; // To store the reference to the specific channel

// Create a new Discord client instance and define its intents
// Intents are subscriptions to specific events and define what events your bot will receive updates for
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

// Log in to Discord with your bot's token (stored in the .env file)
client.login(process.env.TOKEN);

// Event listener that executes once when the client successfully connects to Discord
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`💖 Logged in as ${readyClient.user.tag}`);

  // Fetch the specific channel and store it in danChannel
  danChannel = await client.channels.fetch('1424912904674873374');

  // Start the hourly heartbeat message
  startHeartBeat();
});

// Event listener for when a slash command is executed
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isCommand()) return;

  // Command execution mapping for custom commands
  if (interaction.commandName === 'choochoo') {
    await choochoo.execute(interaction);
  } else if (interaction.commandName === 'gif') {
    await gif.execute(interaction);
  } else if (interaction.commandName === 'randomwalk') {
    await randomwalk.execute(interaction);
  } else if (interaction.commandName === 'roshambo') {
    await roshambo.execute(interaction);
  }
});

// Event listener for handling any received message
client.on(Events.MessageCreate, (message) => {
  if (message.author.bot) return; // Ignore bot messages
  if (message.channelId !== '1291072367035940957') return; // Only respond in specific channel

  // If there are any digits in the message, react with a number emoji
  if (message.content.match(/\d+/)) {
    message.react('🔢');
    return;
  }

  // Respond to a message asking how it makes the user feel
  message.reply(`How does ${message.content} make you feel?`);
});

// Event listener for when a reaction is added to a message
client.on(Events.MessageReactionAdd, (reaction, user) => {
  if (user.bot) return; // Ignore bot reactions

  // Check if the reaction is a heart emoji
  if (reaction.emoji.name === '❤️') {
    heartCount++; // Increment heart count
    fs.writeFileSync('data.json', JSON.stringify({ hearts: heartCount })); // Save updated count to file
    console.log(`Heart count updated to ${heartCount}`);
    return;
  }

  // Handle and format custom emoji reactions
  let emoji = reaction.emoji.name;
  if (reaction.emoji.id) {
    emoji = `<:${reaction.emoji.name}:${reaction.emoji.id}>`;
  }

  // Send a message to the channel indicating the user and emoji used
  danChannel.send(`Thank you <@${user.id}> for reacting with ${emoji}!`);
});

// Function to start the heart count message every hour
function startHeartBeat() {
  postHeartCount(); // Initial post
  setInterval(postHeartCount, 60 * 60 * 1000); // Hourly interval
}

// Function that posts the current heart count in the specific channel
function postHeartCount() {
  danChannel.send(`❤️❤️❤️ I have ${heartCount} hearts ❤️❤️❤️`);
}

console.log('Bot setup complete!');
