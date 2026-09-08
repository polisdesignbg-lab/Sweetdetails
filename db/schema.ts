import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey(),
  data: text("data").notNull(),
});

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull(),
  data: text("data").notNull(),
  position: integer("position").notNull().default(0),
  active: integer("active").notNull().default(1),
});

export const shapes = sqliteTable("shapes", {
  id: text("id").primaryKey(),
  data: text("data").notNull(),
  position: integer("position").notNull().default(0),
  active: integer("active").notNull().default(1),
});

export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug"),
  data: text("data").notNull(),
  position: integer("position").notNull().default(0),
  active: integer("active").notNull().default(1),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  data: text("data").notNull(),
  status: text("status").notNull().default("new"),
  createdAt: text("created_at").notNull(),
});
