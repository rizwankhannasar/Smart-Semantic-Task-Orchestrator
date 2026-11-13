from supabase import create_client
from config import SUPABASE_URL, SUPABASE_KEY

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY
)


def test_connection():
    try:
        response = (
            supabase
            .table("tasks")
            .select("id, title, deadline, status")
            .limit(5)
            .execute()
        )

        print("Supabase connection successful!")
        print(f"Tasks found: {len(response.data)}")

        for task in response.data:
            print(task)

    except Exception as error:
        print("Supabase connection failed!")
        print(error)


if __name__ == "__main__":
    test_connection()