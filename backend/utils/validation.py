def validate_prediction_input(data):
    """
    Validates the input JSON for the /predict endpoint.
    Returns (is_valid, error_message)
    """
    if not data:
        return False, "No input data provided"

    required_fields = ['item', 'stock', 'sales']
    for field in required_fields:
        if field not in data:
            return False, f"Missing required field: {field}"

    if not isinstance(data['item'], str) or not data['item'].strip():
        return False, "Item name must be a non-empty string"

    if not isinstance(data['stock'], (int, float)) or data['stock'] < 0:
        return False, "Stock must be a non-negative number"

    if not isinstance(data['sales'], list) or len(data['sales']) != 5:
        return False, "Sales must be a list of exactly 5 numbers"

    for sale in data['sales']:
        if not isinstance(sale, (int, float)) or sale < 0:
            return False, "All sales values must be non-negative numbers"

    return True, None
