-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "assignable" BOOLEAN NOT NULL,
    "creator_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLabelSettings" (
    "color" TEXT NOT NULL,
    "secondary_color" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "task_label_id" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UserTaskLabel" (
    "user_id" TEXT NOT NULL,
    "task_id" TEXT NOT NULL,
    "label_id" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserLabelSettings_user_id_task_label_id_key" ON "UserLabelSettings"("user_id", "task_label_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserTaskLabel_task_id_label_id_user_id_key" ON "UserTaskLabel"("task_id", "label_id", "user_id");

-- AddForeignKey
ALTER TABLE "Label" ADD CONSTRAINT "Label_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLabelSettings" ADD CONSTRAINT "UserLabelSettings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLabelSettings" ADD CONSTRAINT "UserLabelSettings_task_label_id_fkey" FOREIGN KEY ("task_label_id") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTaskLabel" ADD CONSTRAINT "UserTaskLabel_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTaskLabel" ADD CONSTRAINT "UserTaskLabel_task_id_fkey" FOREIGN KEY ("task_id") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTaskLabel" ADD CONSTRAINT "UserTaskLabel_label_id_fkey" FOREIGN KEY ("label_id") REFERENCES "Label"("id") ON DELETE CASCADE ON UPDATE CASCADE;
