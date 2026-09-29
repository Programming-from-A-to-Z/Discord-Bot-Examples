// Importing modules using ES6 syntax
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('gif')
  .setDescription('Searches GIPHY for gifs!')
  .addStringOption((option) =>
    option.setName('keywords').setDescription('The keywords to search GIPHY with')
  );

// Execute function to interact with GIPHY API and reply with a GIF
export async function execute(interaction) {
  // Initially acknowledging the command interaction
  // can use { flags: MessageFlags.Ephemeral } for reply to be seen by user only
  await interaction.deferReply();

  // Default keyword set to 'kitten' if none provided
  let defaultKeyword = 'kitten';
  const keywords = interaction.options.getString('keywords') ?? defaultKeyword;

  // URL constructed with the provided or default keyword
  let url = `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(keywords)}&api_key=${process.env.GIPHYKEY}&limit=25&rating=g`;

  // Fetching data from GIPHY API
  let response = await fetch(url);
  let json = await response.json();
  console.log(json.data[0].images);

  // Randomly select a GIF from the response
  const index = Math.floor(Math.random() * json.data.length);
  const gif = json.data[index];

  // Creating an embed to display the GIF in the Discord message
  const embed = new EmbedBuilder()
    .setColor('#0099ff')
    .setTitle(`GIF from GIPHY: ${keywords}`)
    .setURL(gif.url)
    .setImage(gif.images.original.url)
    .setFooter({ text: 'Powered by GIPHY' })
    .setAuthor({ name: 'A2Z Bot' })
    .setThumbnail(gif.images.fixed_height_small.url);

  // Following up with the selected GIF embedded in the message
  await interaction.followUp({
    embeds: [embed],
    content: 'GIF from GIPHY: ' + keywords,
  });
}
