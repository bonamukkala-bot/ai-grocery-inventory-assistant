import math

def calculate_stock_metrics(stock, sales):
    """
    Calculates statistical metrics for inventory.
    """
    avg_sales = sum(sales) / len(sales) if sales else 0
    
    if avg_sales == 0:
        days_left = 999 # Representing "infinite" or "no demand"
    else:
        days_left = math.floor(stock / avg_sales)

    # Reorder for 7 days + 20% safety buffer
    reorder_qty = math.ceil((avg_sales * 7) * 1.2)
    
    return {
        "avg_sales": round(avg_sales, 2),
        "days_left": days_left,
        "reorder": reorder_qty
    }
