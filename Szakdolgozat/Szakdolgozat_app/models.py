from django.db import models

# Create your models here.
'''
rnbqkbnrppppppppxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxPPPPPPPPRNBQKBNR
'''

class Position(models.Model):
    FEKETE_VAGY_FEHER_LEETOSEGEK = (("White", "White"),("Black", "Black"),("New", "New"))

    positions_of_figures = models.CharField(max_length=64, default='rnbqkbnrppppppppxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxPPPPPPPPRNBQKBNR')
    step_count = models.DecimalField(max_digits=10, decimal_places=0, default='')
    player_name = models.CharField(max_length=30, default='')
    white_or_black = models.CharField(max_length=5, default='New', choices=FEKETE_VAGY_FEHER_LEETOSEGEK)
    date_of_step = models.DateTimeField(auto_now_add=True)
