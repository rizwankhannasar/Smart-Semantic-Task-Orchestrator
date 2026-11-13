from datetime import datetime, timezone

from supabase_client import supabase
from whatsapp_service import send_whatsapp_message


def check_reminders():
    now = datetime.now(timezone.utc)

    try:
        response = (
            supabase
            .table("tasks")
            .select(
                "id, title, deadline, status, "
                "reminder_10m_sent_at, due_sent_at"
            )
            .eq("status", "pending")
            .execute()
        )

        tasks = response.data or []

        print(f"\nChecking tasks at {now.isoformat()}")

        for task in tasks:
            if not task["deadline"]:
                continue

            deadline = datetime.fromisoformat(
                task["deadline"].replace("Z", "+00:00")
            )

            if deadline.tzinfo is None:
                deadline = deadline.replace(tzinfo=timezone.utc)

            remaining_seconds = (deadline - now).total_seconds()

            # Reminder 10 minutes before deadline
            if (
                0 < remaining_seconds <= 600
                and not task["reminder_10m_sent_at"]
            ):
                message = (
                    f"Reminder: '{task['title']}' "
                    "is due in approximately 10 minutes."
                )

                print(f"\n10-minute reminder: {task['title']}")

                if send_whatsapp_message(message):
                    supabase.table("tasks").update({
                        "reminder_10m_sent_at": now.isoformat()
                    }).eq("id", task["id"]).eq(
                        "status", "pending"
                    ).is_(
                        "reminder_10m_sent_at", "null"
                    ).execute()

            # Reminder when deadline has arrived
            elif (
                remaining_seconds <= 0
                and not task["due_sent_at"]
            ):
                message = (
                    f"Due reminder: '{task['title']}' "
                    "has reached its deadline."
                )

                print(f"\nDue reminder: {task['title']}")

                if send_whatsapp_message(message):
                    supabase.table("tasks").update({
                        "due_sent_at": now.isoformat()
                    }).eq("id", task["id"]).eq(
                        "status", "pending"
                    ).is_(
                        "due_sent_at", "null"
                    ).execute()

    except Exception as error:
        print("Reminder service error:", error)


if __name__ == "__main__":
    check_reminders()