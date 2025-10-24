from rest_framework import serializers

from .models import Stock, Trade


class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = [
            "id",
            "symbol",
            "company_name",
            "last_price",
            "daily_change_percent",
            "last_updated",
        ]


class TradeSerializer(serializers.ModelSerializer):
    stock_symbol = serializers.CharField(source="stock.symbol", read_only=True)
    company_name = serializers.CharField(source="stock.company_name", read_only=True)

    class Meta:
        model = Trade
        fields = [
            "id",
            "stock",
            "stock_symbol",
            "company_name",
            "action",
            "quantity",
            "notional",
            "status",
            "notes",
            "executed_at",
        ]
        read_only_fields = ["executed_at"]


class DashboardSummarySerializer(serializers.Serializer):
    total_symbols = serializers.IntegerField()
    open_positions = serializers.IntegerField()
    todays_buys = serializers.IntegerField()
    todays_sells = serializers.IntegerField()
    total_notional = serializers.DecimalField(max_digits=12, decimal_places=2)
    realized_profit = serializers.DecimalField(max_digits=12, decimal_places=2)
