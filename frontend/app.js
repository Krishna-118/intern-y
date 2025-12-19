const token = localStorage.getItem("token");
if (!token) window.location.href = "index.html";

const payload = JSON.parse(atob(token.split(".")[1]));
document.getElementById("role").innerText = `Logged in as: ${payload.role}`;

const url = "http://localhost:3001/news";

fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("news");
    container.innerHTML = "";

    if (!data.length) {
      container.innerHTML = "<p>No content available for your role.</p>";
      return;
    }

    data.forEach(item => {
      const div = document.createElement("div");
      div.classList.add("news-item", item.role);

      const preview = item.content.length > 150 ? item.content.substring(0, 150) + "..." : item.content;

      div.innerHTML = `
        <h3>${item.title}</h3>
        <div class="meta">
          <span><strong>Category:</strong> ${item.category}</span>
          <span><strong>Status:</strong> ${item.status}</span>
          <span><strong>Created At:</strong> ${item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}</span>
        </div>
        <p>${preview}</p>
      `;

      div.addEventListener("click", () => {
        const modalArticle = document.getElementById("modal-article");
        modalArticle.innerHTML = `
          <h2>${item.title}</h2>
          <div class="meta">
            <span><strong>Category:</strong> ${item.category}</span>
            <span><strong>Status:</strong> ${item.status}</span>
            <span><strong>Created At:</strong> ${item.createdAt ? new Date(item.createdAt).toLocaleString() : "N/A"}</span>
          </div>
          <p>${item.content.replace(/\n/g, "<br>")}</p>
        `;
        document.getElementById("article-modal").style.display = "flex";
        window.scrollTo(0, 0);
      });

      container.appendChild(div);
    });
  })
  .catch(err => {
    console.error(err);
    document.getElementById("news").innerHTML = "<p>Error loading content.</p>";
  });
