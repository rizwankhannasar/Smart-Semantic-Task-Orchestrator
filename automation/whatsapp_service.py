import requests

from config import (
    WHATSAPP_ACCESS_TOKEN,
    WHATSAPP_PHONE_NUMBER_ID,
    WHATSAPP_TO_NUMBER,
    WHATSAPP_DRY_RUN
)


def send_whatsapp_message(message):
    if WHATSAPP_DRY_RUN:
        print("\n[DRY RUN] No real WhatsApp message sent.")
        print(f"Message: {message}")
        return False

    if not all([
        WHATSAPP_ACCESS_TOKEN,
        WHATSAPP_PHONE_NUMBER_ID,
        WHATSAPP_TO_NUMBER
    ]):
        print("WhatsApp credentials are missing.")
        return False

    # Replace with a currently supported Meta Graph API version
    api_version = "vXX.X"

    url = (
        f"https://graph.facebook.com/{api_version}/"
        f"{WHATSAPP_PHONE_NUMBER_ID}/messages"
    )

    headers = {
        "Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "messaging_product": "whatsapp",
        "to": WHATSAPP_TO_NUMBER,
        "type": "text",
        "text": {"body": message}
    }

    try:
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()

        print("WhatsApp message sent successfully!")
        return True

    except requests.RequestException as error:
        print("WhatsApp message failed:", error)
        return False