import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalSubmitInteraction,
} from "discord.js";

import { ExtendedClient } from "../interfaces/ExtendedClient";
import { errorHandler } from "../utils/errorHandler";

/**
 * Handles the logic for the question modal.
 *
 * @param {ExtendedClient} bot The bot's Discord instance.
 * @param {ModalSubmitInteraction} interaction The interaction payload from Discord.
 */
export const processQuestionModal = async (
  bot: ExtendedClient,
  interaction: ModalSubmitInteraction
) => {
  try {
    await interaction.deferReply({ ephemeral: true });
    if (!interaction.guild) {
      await interaction.editReply({
        content:
          "How did you get here without being in a server? Please tell Naomi.",
      });
      return;
    }
    if (!process.env.QUESTION_CHANNEL_ID) {
      await interaction.editReply({
        content: "The question channel is not configured. Please tell Naomi.",
      });
      return;
    }
    const channel =
      interaction.guild.channels.cache.get(process.env.QUESTION_CHANNEL_ID) ||
      (await interaction.guild.channels.fetch(process.env.QUESTION_CHANNEL_ID));
    if (!channel || !channel.isTextBased()) {
      await interaction.editReply({
        content:
          "The question channel is not configured correctly. Please tell Naomi.",
      });
      return;
    }
    const question = interaction.fields.getTextInputValue("question");

    const answerButton = new ButtonBuilder()
      .setCustomId("answer")
      .setLabel("Answer")
      .setStyle(ButtonStyle.Primary);
    const deleteButton = new ButtonBuilder()
      .setCustomId(`delete-${interaction.user.id}`)
      .setLabel("Delete")
      .setStyle(ButtonStyle.Danger);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      answerButton,
      deleteButton
    );

    await channel.send({
      content: `Hey <@!710195136700874893>, someone asked a question:\n\n${question}`,
      components: [row],
    });
    await interaction.editReply({
      content: "Your question has been sent to Naomi!",
    });
  } catch (err) {
    await errorHandler(bot, "process question modal", err);
  }
};
