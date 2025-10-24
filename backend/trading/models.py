from django.db import models


class Stock(models.Model):
    symbol = models.CharField(max_length=10, unique=True)
    company_name = models.CharField(max_length=128)
    last_price = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    daily_change_percent = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    last_updated = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["symbol"]

    def __str__(self) -> str:
        return f"{self.symbol}"


class Trade(models.Model):
    class Action(models.TextChoices):
        BUY = "BUY", "Buy"
        SELL = "SELL", "Sell"

    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, related_name="trades")
    action = models.CharField(max_length=4, choices=Action.choices)
    quantity = models.PositiveIntegerField()
    notional = models.DecimalField(max_digits=12, decimal_places=2)
    status = models.CharField(max_length=32, default="completed")
    notes = models.TextField(blank=True)
    executed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-executed_at"]

    def __str__(self) -> str:
        return f"{self.action} {self.stock.symbol}"
