'use server';

import prisma from '../lib/prisma';
import { Message } from 'ai';

export const storeProject = async (id: string) => prisma.project.create({ data: { id } });

export const storeChatMessages = async (
  projectId: string,
  messages: Message[],
) => prisma.chatMessage.createMany({
  data: messages.map((message) => ({
    id: message.id,
    projectId,
    content: message.content,
    role: message.role,
  })),
  skipDuplicates: true,
});

export const getChatMessages = async (projectId: string) => prisma.chatMessage.findMany({
  where: { projectId },
});
