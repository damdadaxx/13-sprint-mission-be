// ============================================
// 시드 스크립트
// ============================================

import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  // 기존 데이터 삭제 (FK 의존성 역순)
  await prisma.productComment.deleteMany();
  await prisma.articleComment.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.article.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  console.log("🧹 기존 데이터 삭제 완료");

  // ----------- 유저 생성 -----------
  const users = await Promise.all(
    Array.from({ length: 5 }).map(() =>
      prisma.user.create({
        data: {
          username: faker.internet.username(),
          avatar: faker.image.avatar(),
        },
      }),
    ),
  );
  console.log(`✅ 유저 ${users.length}명 생성`);

  const randomUser = () => users[Math.floor(Math.random() * users.length)];

  // ----------- 초기 상품 데이터 + 댓글 X -----------
  await prisma.product.create({
    data: {
      name: "맥북 프로",
      description: "맥북 프로 입니다.",
      likeCount: faker.number.int({ min: 0, max: 100 }),
      userId: randomUser().id,
      tags: {
        createMany: {
          data: [{ tag: "전자제품" }, { tag: "맥북" }],
        },
      },
    },
  });

  await prisma.product.create({
    data: {
      name: "냉장고",
      description: "냉장고 입니다.",
      likeCount: faker.number.int({ min: 0, max: 100 }),
      userId: randomUser().id,
      tags: {
        createMany: {
          data: [{ tag: "전자제품" }, { tag: "가전" }],
        },
      },
    },
  });

  console.log("✅ 초기 상품 2개 생성");

  // ----------- 초기 게시글 + 댓글 X -----------
  await prisma.article.create({
    data: {
      title: "맥북 16인치 16기가 1테라 정도 사양이면 얼마에 팔아야 하나요?",
      content: "맥북 16인치 16기가 1테라 정도 사양이면 얼마에 팔아야 하나요?",
      userId: randomUser().id,
    },
  });

  await prisma.article.create({
    data: {
      title: "아이폰 프로 16 구합니다",
      content: "아이폰 프로 16 구합니다. 연락주세요.",
      userId: randomUser().id,
    },
  });

  console.log("✅ 초기 게시글 2개 생성");

  // ----------- 랜덤 데이터 30개 -----------
  const randomDataPromises = [];

  for (let i = 0; i < 30; i++) {
    randomDataPromises.push(
      prisma.product.create({
        data: {
          name: faker.string.alphanumeric(5),
          description: faker.commerce.productDescription(),
          price: faker.number.int({ min: 10000, max: 500000 }),
          likeCount: faker.number.int({ min: 0, max: 100 }),
          userId: randomUser().id,
          tags: {
            createMany: {
              data: [
                { tag: faker.string.alphanumeric(5) },
                { tag: faker.string.alphanumeric(5) },
              ],
            },
          },
          productComments: {
            createMany: {
              data: [
                { content: faker.lorem.sentence(), userId: randomUser().id },
                { content: faker.lorem.sentence(), userId: randomUser().id },
              ],
            },
          },
        },
      }),
    );

    randomDataPromises.push(
      prisma.article.create({
        data: {
          title: faker.lorem.sentence({ min: 3, max: 8 }),
          content: faker.lorem.paragraph(),
          userId: randomUser().id,
          articleComments: {
            createMany: {
              data: [
                { content: faker.lorem.sentence(), userId: randomUser().id },
                { content: faker.lorem.sentence(), userId: randomUser().id },
              ],
            },
          },
        },
      }),
    );
  }

  await Promise.all(randomDataPromises);
  console.log("🎲 랜덤 상품 30개, 게시글 30개 생성");

  console.log("✨ 시드 데이터 생성 완료!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
