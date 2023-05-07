-- CreateTable
CREATE TABLE "TaskLabel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "assignable" BOOLEAN NOT NULL,
    "creator_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskLabel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTaskLabelSettings" (
    "color" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "task_label_id" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTaskLabelSettings_user_id_task_label_id_key" ON "UserTaskLabelSettings"("user_id", "task_label_id");

-- AddForeignKey
ALTER TABLE "TaskLabel" ADD CONSTRAINT "TaskLabel_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTaskLabelSettings" ADD CONSTRAINT "UserTaskLabelSettings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTaskLabelSettings" ADD CONSTRAINT "UserTaskLabelSettings_task_label_id_fkey" FOREIGN KEY ("task_label_id") REFERENCES "TaskLabel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
