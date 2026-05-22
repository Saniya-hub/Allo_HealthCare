import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {

  const bangalore = await prisma.warehouse.create({
    data: {
      name: "Bangalore Warehouse"
    }
  })

  const mumbai = await prisma.warehouse.create({
    data: {
      name: "Mumbai Warehouse"
    }
  })

  const iphone = await prisma.product.create({
    data: {
      name: "iPhone 15"
    }
  })

  const shoes = await prisma.product.create({
    data: {
      name: "Nike Shoes"
    }
  })

  await prisma.inventory.createMany({
    data: [
      {
        productId: iphone.id,
        warehouseId: bangalore.id,
        totalStock: 10
      },
      {
        productId: iphone.id,
        warehouseId: mumbai.id,
        totalStock: 5
      },
      {
        productId: shoes.id,
        warehouseId: bangalore.id,
        totalStock: 7
      }
    ]
  })

  console.log("Seed data inserted")
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })