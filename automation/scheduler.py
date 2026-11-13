from apscheduler.schedulers.blocking import BlockingScheduler

from reminder_service import check_reminders


scheduler = BlockingScheduler(timezone="UTC")

# Check tasks every minute
scheduler.add_job(
    check_reminders,
    trigger="interval",
    minutes=1,
    id="task_reminder_job",
    max_instances=1,
    coalesce=True
)

if __name__ == "__main__":
    print("Smart Task Reminder Scheduler Started!")
    print("Checking tasks every 1 minute.")
    print("Press CTRL + C to stop.\n")

    # Run once immediately
    check_reminders()

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        print("\nScheduler stopped.")