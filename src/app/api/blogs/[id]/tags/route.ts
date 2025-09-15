import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Obter blogId dos parâmetros da URL
    const blogId = parseInt(request.url.split('/blogs/')[1].split('/')[0]);

    console.log("🔍 Buscando tags para blogId:", blogId);

    const tags = await prisma.tag.findMany({
      where: {
        blogId: blogId,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        color: true,
      },
    });

    console.log("✅ Tags encontradas:", tags.length);

    return NextResponse.json(tags);
  } catch (error) {
    console.error("❌ Erro ao buscar tags:", error);
    return NextResponse.json(
      { 
        message: "Erro interno do servidor",
        error: error instanceof Error ? error.message : "Erro desconhecido"
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
