import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const userData = sqliteTable("user_data", {
  userId: text("user_id").primaryKey(),
  email: text("email").notNull(),
  payload: text("payload").notNull().default("{}"),
  updatedAt: integer("updated_at").notNull(),
});

export const photoFiles = sqliteTable(
  "photo_files",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    objectKey: text("object_key").notNull(),
    filename: text("filename").notNull(),
    contentType: text("content_type").notNull(),
    date: text("date").notNull(),
    note: text("note").notNull().default(""),
    createdAt: integer("created_at").notNull(),
  },
  (table) => [index("idx_photo_files_user_created").on(table.userId, table.createdAt)],
);
