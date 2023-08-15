import {
  ActionRowBuilder,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

import { Command } from "../interfaces/Command";
import { errorHandler } from "../utils/errorHandler";

export const ask: Command = {
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription(
      "Ask Naomi an anonymous question. Make sure to follow our community guidelines."
    )
    .setDMPermission(false),
  run: async (bot, interaction) => {
    try {
      const input = new TextInputBuilder()
        .setCustomId("question")
        .setLabel("What's your question?")
        .setMaxLength(2000)
        .setRequired(true)
        .setStyle(TextInputStyle.Paragraph);
      const row = new ActionRowBuilder<TextInputBuilder>().addComponents(input);
      const modal = new ModalBuilder()
        .setCustomId("ask")
        .setTitle("Ask Naomi")
        .addComponents(row);
      await interaction.showModal(modal);
    } catch (err) {
      await errorHandler(bot, "ask command", err);
      await interaction.editReply({
        content:
          "An error occurred while running this command. Please try again later.",
      });
    }
  },
};
