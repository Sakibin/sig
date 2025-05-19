const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

const BASE_API_URL = "https://alltradingapi.com/signal_list_gen_vip/qx_api";

// Formatted signal data
app.get("/api/signal", async (req, res) => {
  try {
    const {
      start,
      end,
      duration,
      currency_pairs,
      percentage_min = 90,
    } = req.query;

    const apiUrl = `${BASE_API_URL}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&duration=${encodeURIComponent(duration)}&currency_pairs=${encodeURIComponent(currency_pairs)}&operation_mode=normal&percentage_min=${percentage_min}&apply_filter=1&is_separate=1&backtest_advanced=off`;

    const response = await axios.get(apiUrl);
    const data = response.data;

    const formattedResponse = {
      execution_details: {
        execution_time: data.detalhes_execucao?.tempo_execucao || "",
        timezone: data.detalhes_execucao?.fuso_horario || "",
        date: data.detalhes_execucao?.data || "",
        creator: "Prime",
      },
      signals: (data.signals || []).map(signal => ({
        asset: signal.ativos.replace("_otc", ""),
        entry_time: signal.entrada,
        main_direction: signal.direcao_principal === "put" ? "sell" : "buy"
        
      }))
    };

    res.json(formattedResponse);
  } catch (error) {
    console.error("Error fetching signal:", error.message);
    res.status(500).json({ error: "Failed to fetch signal data" });
  }
});

// Raw response
app.get("/api/signals", async (req, res) => {
  try {
    const {
      start,
      end,
      duration,
      currency_pairs,
      percentage_min = 90,
    } = req.query;

    const apiUrl = `${BASE_API_URL}?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}&duration=${encodeURIComponent(duration)}&currency_pairs=${encodeURIComponent(currency_pairs)}&operation_mode=normal&percentage_min=${percentage_min}&apply_filter=1&is_separate=1&backtest_advanced=off`;

    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching raw signal data:", error.message);
    res.status(500).json({ error: "Failed to fetch signals" });
  }
});

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
