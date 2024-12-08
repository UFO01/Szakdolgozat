from django.test import TestCase
from .models import Position

class PositionModelTest(TestCase):

    def test_position_defaults(self):
        position = Position()
        position.save()

        self.assertEqual(position.positions_of_figures, 'rnbqkbnrppppppppxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxPPPPPPPPRNBQKBNR')
        self.assertEqual(position.step_count, 0)
        self.assertEqual(position.player_name, '')
        self.assertEqual(position.white_or_black, 'New')
        self.assertIsNotNone(position.date_of_step)

    def test_position_custom_values(self):
        custom_position = Position(
            positions_of_figures='xxQxxNxxPPPPxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxppppppxxnxxqxx',
            step_count=15,
            player_name='TestPlayer',
            white_or_black='White'
        )
        custom_position.save()

        self.assertEqual(custom_position.positions_of_figures, 'xxQxxNxxPPPPxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxppppppxxnxxqxx')
        self.assertEqual(custom_position.step_count, 15)
        self.assertEqual(custom_position.player_name, 'TestPlayer')
        self.assertEqual(custom_position.white_or_black, 'White')

    def test_invalid_white_or_black_choice(self):
        with self.assertRaises(ValueError):
            Position.objects.create(white_or_black='InvalidChoice')

# Create your tests here.
