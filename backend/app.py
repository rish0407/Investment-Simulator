
from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

@app.route("/simulate", methods=["POST"])
def simulate():
    data = request.get_json()
    symbol = data.get("symbol", "AAPL")
    strategy = data.get("strategy", "dca")
    amount = float(data.get("amount", 1000))
    start_date = data.get("start_date", "2020-01-01")
    end_date = data.get("end_date", datetime.today().strftime('%Y-%m-%d'))

    try:
        df = yf.download(symbol, start=start_date, end=end_date, interval="1d")
        df = df["Adj Close"].dropna()
        df = df.resample("M").first()  # Monthly data

        if strategy == "dca":
            # Invest equal amount every month
            monthly_investment = amount / len(df)
            shares = 0
            for price in df:
                shares += monthly_investment / price
            final_value = shares * df.iloc[-1]
        elif strategy == "lump_sum":
            # Buy once at the beginning
            initial_price = df.iloc[0]
            shares = amount / initial_price
            final_value = shares * df.iloc[-1]
        else:
            return jsonify({"error": "Invalid strategy"}), 400

        timeline = df.index.strftime('%Y-%m').tolist()
        values = []

        # DCA incremental value tracking
        if strategy == "dca":
            shares = 0
            values = []
            for price in df:
                shares += monthly_investment / price
                values.append(round(shares * price, 2))
        elif strategy == "lump_sum":
            shares = amount / df.iloc[0]
            values = [round(shares * price, 2) for price in df]

        return jsonify({
            "symbol": symbol,
            "strategy": strategy,
            "timeline": timeline,
            "values": values,
            "final_value": round(final_value, 2)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
