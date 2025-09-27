from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route("/crawl", methods=["GET"])
def crawl():
    q = request.args.get('q', 'none')
    # mock data: en la práctica aquí iría el scrapper
    return jsonify([{"store": "demo", "product": q, "price": 1234}])

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000)
