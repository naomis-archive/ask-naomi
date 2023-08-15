import { SlashCommandBuilder } from "discord.js";

import { Command } from "../interfaces/Command";
import { errorHandler } from "../utils/errorHandler";

export const ask: Command = {
  data: new SlashCommandBuilder()
    .setName("ask")
    .setDescription("Ask Naomi an anonymous question.")
    .setDMPermission(false),
  run: async (bot, interaction) => {
    try {
      await interaction.reply({
        content: "Coming soon.",
      });
    } catch (err) {
      await errorHandler(bot, "ask command", err);
      await interaction.editReply({
        content:
          "An error occurred while running this command. Please try again later.",
      });
    }
  },
};
