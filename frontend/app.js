const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "index.html";
}

const payload = JSON.parse(atob(token.split(".")[1]));
document.getElementById("role").innerText = `Logged in as: ${payload.role}`;

const url = "http://localhost:3001/news";

fetch(url, {
  headers: { Authorization: `Bearer ${token}` },
})
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("news");
    container.innerHTML = "";

    if (data.length === 0) {
      container.innerHTML = "<p>No content available for your role.</p>";
      return;
    }

    data.forEach(item => {
      const div = document.createElement("div");
      div.style.border = "1px solid #ccc";
      div.style.padding = "10px";
      div.style.marginBottom = "10px";
      div.style.borderRadius = "5px";
      div.style.backgroundColor = "#f9f9f9";

      const createdAt = item.createdAt
        ? new Date(item.createdAt).toLocaleString()
        : "N/A";

      div.innerHTML = `
        <h3>${item.title}</h3>
        <p><strong>Category:</strong> ${item.category}</p>
        <p><strong>Status:</strong> ${item.status}</p>
        <p><strong>Created At:</strong> ${createdAt}</p>
        <p>${item.content}</p>
      `;
      container.appendChild(div);
    });
  })
  .catch(err => {
    console.error(err);
    document.getElementById("news").innerHTML = "<p>Error loading content.</p>";
  });
