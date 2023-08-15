import {
  ActionRowBuilder,
  Client,
  Events,
  GatewayIntentBits,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

import { ExtendedClient } from "./interfaces/ExtendedClient";
import { processQuestionModal } from "./modules/processQuestionModal";
import { errorHandler } from "./utils/errorHandler";
import { loadCommands } from "./utils/loadCommands";
import { logHandler } from "./utils/logHandler";
import { registerCommands } from "./utils/registerCommands";
import { isGuildCommandCommand } from "./utils/typeGuards";
import { validateEnv } from "./utils/validateEnv";

(async () => {
  try {
    const bot = new Client({
      intents: [GatewayIntentBits.Guilds],
    }) as ExtendedClient;
    bot.env = validateEnv();
    await loadCommands(bot);

    bot.on(Events.InteractionCreate, async (interaction) => {
      try {
        if (interaction.isChatInputCommand()) {
          if (!isGuildCommandCommand(interaction)) {
            await interaction.reply({
              content: "You can only run this in a guild.",
              ephemeral: true,
            });
            return;
          }
          const target = bot.commands.find(
            (c) => c.data.name === interaction.commandName
          );
          if (!target) {
            await interaction.reply({
              content: "Command not found.",
              ephemeral: true,
            });
            return;
          }
          await target.run(bot, interaction);
        }
        if (interaction.isModalSubmit()) {
          if (interaction.customId === "ask") {
            await processQuestionModal(bot, interaction);
          }
          if (interaction.customId === "answer") {
            await interaction.deferReply({
              ephemeral: true,
            });
            if (!interaction.message) {
              await interaction.editReply({
                content: "Something went wrong. Please try again.",
              });
              return;
            }
            const answer = interaction.fields.getTextInputValue("answer");
            await interaction.message.edit({
              content: `**${interaction.message.content
                .split("\n")
                .slice(-1)}**\n\n${answer}`,
              components: [],
            });
            await interaction.editReply({
              content: "Your answer has been submitted.",
            });
          }
        }
        if (interaction.isButton()) {
          if (
            !["710195136700874893", "465650873650118659"].includes(
              interaction.user.id
            )
          ) {
            await interaction.reply({
              content: "Only Naomi can click these buttons.",
              ephemeral: true,
            });
            return;
          }
          if (interaction.customId === "answer") {
            const input = new TextInputBuilder()
              .setCustomId("answer")
              .setLabel("How do you answer?")
              .setMaxLength(2000)
              .setRequired(true)
              .setStyle(TextInputStyle.Paragraph);
            const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
              input
            );
            const modal = new ModalBuilder()
              .setCustomId("answer")
              .setTitle("Answer Question")
              .addComponents(row);
            await interaction.showModal(modal);
          }
          if (interaction.customId.startsWith("delete-")) {
            await interaction.deferReply({ ephemeral: true });
            const id = interaction.customId.split("-")[1];
            await interaction.message.edit({
              content: `This message has been flagged for violating our community guidelines.`,
              components: [],
            });
            await interaction.editReply({
              content: `For moderation purposes, that question was asked by <@!${id}> (${id}).`,
            });
          }
        }
      } catch (err) {
        await errorHandler(bot, "interaction create event", err);
      }
    });

    bot.on(Events.ClientReady, async () => {
      await registerCommands(bot);
      logHandler.log("info", "Bot is ready.");
    });

    await bot.login(bot.env.token);
  } catch (err) {
    const bot = new Client({
      intents: [GatewayIntentBits.Guilds],
    }) as ExtendedClient;
    bot.env = validateEnv();
    await errorHandler(bot, "entry file", err);
  }
})();
