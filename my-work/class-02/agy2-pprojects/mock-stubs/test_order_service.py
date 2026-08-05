import unittest
from unittest.mock import MagicMock, call
from order_service import (
    Order,
    InventoryService,
    PaymentGateway,
    InventoryShortageError,
    PaymentFailedError,
    InvalidOrderError,
)


class TestCartManagement(unittest.TestCase):
    """Tests for adding, removing, and validating cart items."""

    def test_add_item_new(self):
        mock_inv = MagicMock(spec=InventoryService)
        mock_pay = MagicMock(spec=PaymentGateway)
        order = Order(mock_inv, mock_pay, "test@example.com")

        order.add_item("prod_1", 10.0, 2)
        self.assertIn("prod_1", order.items)
        self.assertEqual(order.items["prod_1"], {"price": 10.0, "qty": 2})

    def test_add_item_existing_accumulates_qty(self):
        mock_inv = MagicMock(spec=InventoryService)
        mock_pay = MagicMock(spec=PaymentGateway)
        order = Order(mock_inv, mock_pay, "test@example.com")

        order.add_item("prod_1", 10.0, 2)
        order.add_item("prod_1", 10.0, 3)
        self.assertEqual(order.items["prod_1"]["qty"], 5)

    def test_add_item_negative_price_raises_value_error(self):
        mock_inv = MagicMock(spec=InventoryService)
        mock_pay = MagicMock(spec=PaymentGateway)
        order = Order(mock_inv, mock_pay, "test@example.com")

        with self.assertRaisesRegex(ValueError, "Price cannot be negative"):
            order.add_item("prod_1", -5.0, 1)

    def test_add_item_invalid_quantity_raises_value_error(self):
        mock_inv = MagicMock(spec=InventoryService)
        mock_pay = MagicMock(spec=PaymentGateway)
        order = Order(mock_inv, mock_pay, "test@example.com")

        with self.assertRaisesRegex(ValueError, "Quantity must be greater than zero"):
            order.add_item("prod_1", 10.0, 0)

        with self.assertRaisesRegex(ValueError, "Quantity must be greater than zero"):
            order.add_item("prod_1", 10.0, -2)

    def test_remove_item(self):
        mock_inv = MagicMock(spec=InventoryService)
        mock_pay = MagicMock(spec=PaymentGateway)
        order = Order(mock_inv, mock_pay, "test@example.com")

        order.add_item("prod_1", 10.0, 1)
        order.remove_item("prod_1")
        self.assertNotIn("prod_1", order.items)

    def test_remove_nonexistent_item_does_not_raise(self):
        mock_inv = MagicMock(spec=InventoryService)
        mock_pay = MagicMock(spec=PaymentGateway)
        order = Order(mock_inv, mock_pay, "test@example.com")

        order.remove_item("non_existent_prod")  # Should pass without error


class TestDiscountsAndPricing(unittest.TestCase):
    """Tests for raw total calculation and discount rules."""

    def test_total_price_calculation(self):
        mock_inv = MagicMock(spec=InventoryService)
        mock_pay = MagicMock(spec=PaymentGateway)
        order = Order(mock_inv, mock_pay, "test@example.com")

        order.add_item("item_1", 20.0, 2)  # 40.0
        order.add_item("item_2", 15.5, 1)  # 15.5
        self.assertEqual(order.total_price, 55.5)

    def test_vip_discount_20_percent(self):
        mock_inv = MagicMock(spec=InventoryService)
        mock_pay = MagicMock(spec=PaymentGateway)
        order = Order(mock_inv, mock_pay, "vip@example.com", is_vip=True)

        order.add_item("item_1", 50.0, 1)  # $50 total
        self.assertEqual(order.apply_discount(), 40.00)  # 20% off 50 = 40

    def test_regular_customer_over_100_gets_10_percent(self):
        mock_inv = MagicMock(spec=InventoryService)
        mock_pay = MagicMock(spec=PaymentGateway)
        order = Order(mock_inv, mock_pay, "regular@example.com", is_vip=False)

        order.add_item("item_1", 120.0, 1)  # $120 total (> 100)
        self.assertEqual(order.apply_discount(), 108.00)  # 10% off 120 = 108

    def test_regular_customer_under_100_no_discount(self):
        mock_inv = MagicMock(spec=InventoryService)
        mock_pay = MagicMock(spec=PaymentGateway)
        order = Order(mock_inv, mock_pay, "regular@example.com", is_vip=False)

        order.add_item("item_1", 80.0, 1)  # $80 total (<= 100)
        self.assertEqual(order.apply_discount(), 80.00)


class TestCheckoutWorkflow(unittest.TestCase):
    """Tests for checkout orchestration using mock inventory and payment services."""

    def test_checkout_empty_cart_raises_invalid_order_error(self):
        mock_inv = MagicMock(spec=InventoryService)
        mock_pay = MagicMock(spec=PaymentGateway)
        order = Order(mock_inv, mock_pay, "test@example.com")

        with self.assertRaisesRegex(InvalidOrderError, "Cannot checkout an empty cart"):
            order.checkout()

    def test_checkout_insufficient_stock_raises_inventory_shortage_error(self):
        mock_inv = MagicMock(spec=InventoryService)
        mock_pay = MagicMock(spec=PaymentGateway)
        
        # Mock inventory stock return: product has only 1 in stock, but order requests 3
        mock_inv.get_stock.return_value = 1

        order = Order(mock_inv, mock_pay, "test@example.com")
        order.add_item("prod_1", 10.0, 3)

        with self.assertRaisesRegex(InventoryShortageError, "Not enough stock for prod_1"):
            order.checkout()

        # Payment should NOT be charged and stock should NOT be decremented
        mock_pay.charge.assert_not_called()
        mock_inv.decrement_stock.assert_not_called()

    def test_checkout_payment_declined_raises_payment_failed_error(self):
        mock_inv = MagicMock(spec=InventoryService)
        mock_pay = MagicMock(spec=PaymentGateway)

        mock_inv.get_stock.return_value = 10
        mock_pay.charge.return_value = False  # Payment declined

        order = Order(mock_inv, mock_pay, "test@example.com")
        order.add_item("prod_1", 50.0, 1)

        with self.assertRaisesRegex(PaymentFailedError, "Transaction declined by gateway"):
            order.checkout()

        # Stock should NOT be decremented if payment fails
        mock_inv.decrement_stock.assert_not_called()

    def test_checkout_payment_gateway_exception_raises_payment_failed_error(self):
        mock_inv = MagicMock(spec=InventoryService)
        mock_pay = MagicMock(spec=PaymentGateway)

        mock_inv.get_stock.return_value = 10
        mock_pay.charge.side_effect = Exception("Network timeout")

        order = Order(mock_inv, mock_pay, "test@example.com")
        order.add_item("prod_1", 50.0, 1)

        with self.assertRaisesRegex(PaymentFailedError, "Payment gateway error: Network timeout"):
            order.checkout()

        # Stock should NOT be decremented
        mock_inv.decrement_stock.assert_not_called()

    def test_checkout_success_vip_order(self):
        mock_inv = MagicMock(spec=InventoryService)
        mock_pay = MagicMock(spec=PaymentGateway)

        # Setup mock return values
        mock_inv.get_stock.side_effect = lambda prod_id: {"prod_1": 10, "prod_2": 5}[prod_id]
        mock_pay.charge.return_value = True

        order = Order(mock_inv, mock_pay, "vip@example.com", is_vip=True)
        order.add_item("prod_1", 100.0, 1)  # 100
        order.add_item("prod_2", 50.0, 2)   # 100 -> Total raw = 200, VIP 20% off -> 160.0

        result = order.checkout()

        # Verify stock checks
        self.assertEqual(mock_inv.get_stock.call_count, 2)
        mock_inv.get_stock.assert_has_calls([call("prod_1"), call("prod_2")], any_order=True)

        # Verify payment charged with correct discounted amount
        mock_pay.charge.assert_called_once_with(160.00, "USD")

        # Verify stock decremented for all items
        mock_inv.decrement_stock.assert_has_calls([call("prod_1", 1), call("prod_2", 2)], any_order=True)

        # Verify order state updates
        self.assertTrue(order.is_paid)
        self.assertEqual(order.status, "COMPLETED")
        self.assertEqual(result, {"status": "success", "charged_amount": 160.00})


if __name__ == "__main__":
    unittest.main()

