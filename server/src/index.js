require("dotenv").config();
const express = require("express");
const cors    = require("cors");

const todosRouter = require("./routes/todos");
const adminRouter = require("./routes/admin");

const app = express();

app.use(express.json());
app.use(cors({ origin: "*", methods: ["GET","POST","PATCH","DELETE"] }));

app.use("/todos", todosRouter);
app.use("/admin", adminRouter);

app.get("/health", (_req, res) => res.json({ ok: true }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on :${PORT}`));
