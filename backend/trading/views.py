from datetime import date
from decimal import Decimal

from django.db.models import Case, F, IntegerField, Q, Sum, Value, When
from django.utils import timezone
from rest_framework import viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Stock, Trade
from .serializers import DashboardSummarySerializer, StockSerializer, TradeSerializer


class StockViewSet(viewsets.ModelViewSet):
    queryset = Stock.objects.all().order_by("symbol")
    serializer_class = StockSerializer
    http_method_names = ["get", "post", "patch", "put", "delete", "head", "options"]


class TradeViewSet(viewsets.ModelViewSet):
    queryset = Trade.objects.select_related("stock").all()
    serializer_class = TradeSerializer
    http_method_names = ["get", "post", "patch", "put", "delete", "head", "options"]


class DashboardSummaryView(APIView):
    def get(self, request, *_args, **_kwargs):
        today: date = timezone.localdate()

        totals = Trade.objects.aggregate(
            buy_notional=Sum("notional", filter=Q(action=Trade.Action.BUY)),
            sell_notional=Sum("notional", filter=Q(action=Trade.Action.SELL)),
        )

        total_symbols = Stock.objects.count() or Trade.objects.values("stock").distinct().count()

        todays_buys = Trade.objects.filter(
            action=Trade.Action.BUY, executed_at__date=today
        ).count()
        todays_sells = Trade.objects.filter(
            action=Trade.Action.SELL, executed_at__date=today
        ).count()

        position_data = (
            Trade.objects.values("stock")
            .annotate(
                net_quantity=Sum(
                    Case(
                        When(action=Trade.Action.BUY, then=F("quantity")),
                        When(action=Trade.Action.SELL, then=-1 * F("quantity")),
                        default=Value(0),
                        output_field=IntegerField(),
                    )
                )
            )
            .filter(net_quantity__gt=0)
        )
        open_positions = position_data.count()

        buy_notional = totals.get("buy_notional") or Decimal(0)
        sell_notional = totals.get("sell_notional") or Decimal(0)
        total_notional = buy_notional
        realized_profit = sell_notional - buy_notional

        serializer = DashboardSummarySerializer(
            {
                "total_symbols": total_symbols,
                "open_positions": open_positions,
                "todays_buys": todays_buys,
                "todays_sells": todays_sells,
                "total_notional": total_notional,
                "realized_profit": realized_profit,
            }
        )
        return Response(serializer.data)
