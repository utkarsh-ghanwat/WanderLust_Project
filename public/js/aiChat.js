const btn = document.getElementById("ai-button");
const chat = document.getElementById("ai-chat");
const body = document.getElementById("chat-body");
const input = document.getElementById("userMessage");
const sendBtn = document.getElementById("sendBtn");

// Open / Close chat
btn.onclick = () => {
    chat.classList.toggle("d-none");
};

async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;

    // User bubble
    body.innerHTML += `
        <div class="user-msg">
            <div class="bubble user-bubble">${message}</div>
        </div>
    `;

    input.value = "";
    body.scrollTop = body.scrollHeight;

    try {
        const res = await fetch("/api/ai/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
        });

        const data = await res.json();

        // AI bubble (Markdown rendered)
        body.innerHTML += `
            <div class="ai-msg">
                <div class="bubble ai-bubble">
                    ${marked.parse(data.reply)}
                </div>
            </div>
        `;

        body.scrollTop = body.scrollHeight;
    } catch (err) {
        body.innerHTML += `
            <div class="ai-msg">
                <div class="bubble ai-bubble">
                    ❌ Unable to connect to WanderLust AI.
                </div>
            </div>
        `;
    }
}

sendBtn.onclick = sendMessage;

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});