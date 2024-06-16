import { config } from "dotenv";
import { eachDayOfInterval, format, subDays } from "date-fns";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { categories, accounts, transactions } from "@/db/schema";
import { convertAmountToMiliunits } from "@/lib/utils";

config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const SEED_USER_ID = "user_2hmGQzIffMaPwxAmKkdWEw0sjRh";
const SEED_CATEGORIES = [
  { id: "category_1", name: "Food", userId: SEED_USER_ID, plaidId: null },
  { id: "category_2", name: "Rent", userId: SEED_USER_ID, plaidId: null },
  { id: "category_3", name: "Utilities", userId: SEED_USER_ID, plaidId: null },
  {
    id: "category_4",
    name: "Transportation",
    userId: SEED_USER_ID,
    plaidId: null,
  },
  { id: "category_5", name: "Health", userId: SEED_USER_ID, plaidId: null },
  {
    id: "category_6",
    name: "Entertainment",
    userId: SEED_USER_ID,
    plaidId: null,
  },
  { id: "category_7", name: "Shopping", userId: SEED_USER_ID, plaidId: null },
  {
    id: "category_8",
    name: "Miscellaneous",
    userId: SEED_USER_ID,
    plaidId: null,
  },
];

const SEED_ACCOUNTS = [
  { id: "account_1", name: "Checking", userId: SEED_USER_ID, plaidId: null },
  { id: "account_2", name: "Savings", userId: SEED_USER_ID, plaidId: null },
];

const defaultTo = new Date();
const defaultFrom = subDays(defaultTo, 90);

const SEED_TRANSACTIONS: (typeof transactions.$inferSelect)[] = [];

const generateRandomAmount = (category: typeof categories.$inferInsert) => {
  switch (category.name) {
    case "Rent":
      return Math.random() * 400 + 90;
    case "Utilities":
      return Math.random() * 200 + 50;
    case "Food":
      return Math.random() * 30 + 10;
    case "Transportation":
    case "Health":
      return Math.random() * 50 + 15;
    case "Entertainment":
    case "Clothing":
    case "Miscellaneous":
      return Math.random() * 100 + 20;
    default:
      return Math.random() * 50 + 10;
  }
};

const generateTransactionsForDay = (day: Date) => {
  const numTransactions = Math.floor(Math.random() * 4) + 1;

  for (let i = 0; i < numTransactions; i++) {
    const category =
      SEED_CATEGORIES[Math.floor(Math.random() * SEED_CATEGORIES.length)];

    const isExpense = Math.random() > 0.6;
    const amount = generateRandomAmount(category);
    const formattedAmount = convertAmountToMiliunits(
      isExpense ? -amount : amount
    );

    SEED_TRANSACTIONS.push({
      id: `transaction_${format(day, "yyyy-MM-dd")}_${i}`,
      accountId: SEED_ACCOUNTS[0].id, //Using the first account for all transactions
      categoryId: category.id,
      date: day,
      amount: formattedAmount,
      payee: "Merchant",
      notes: "Random transaction",
    });
  }
};

const generateTransactions = () => {
  const days = eachDayOfInterval({ start: defaultFrom, end: defaultTo });
  days.forEach((day) => generateTransactionsForDay(day));
};

generateTransactions();

const main = async () => {
  try {
    await db.delete(transactions).execute();
    await db.delete(accounts).execute();
    await db.delete(categories).execute();
    // SEED CATEGORIES
    await db.insert(categories).values(SEED_CATEGORIES).execute();
    // SEED ACCOUNTS
    await db.insert(accounts).values(SEED_ACCOUNTS).execute();
    // SEED TRANSACTIONS
    await db.insert(transactions).values(SEED_TRANSACTIONS).execute();
  } catch (error) {
    console.log("Error during seed:", error);
    process.exit(1);
  }
};

main();