import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'
import bcrypt from 'bcryptjs'

const dbPath = path.resolve(__dirname, '../dev.db')
const adapter = new PrismaLibSql({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  const email = 'breona@eloquentdigitalmarketing.net'
  const password = await bcrypt.hash('Eloquent2024!', 12)
  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email, password, role: 'admin',
      profile: { create: { pointPerson: 'Breona', email, businessName: 'Eloquent Digital Marketing', title: 'Admin' } },
    },
  })
  console.log(`Admin user created: ${admin.email}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
