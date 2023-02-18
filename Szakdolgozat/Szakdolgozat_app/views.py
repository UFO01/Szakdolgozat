from django.shortcuts import render
from django.http import HttpResponse
from .models import Position

# Create your views here.

def index(request):

    context = {}

    if request.method == 'POST':
      if len(Position.objects.all()) >= 1:
        if request.POST.get('positions') != Position.objects.last().positions_of_figures:
            p = Position()
            p.positions_of_figures = request.POST.get('positions')
            if p.positions_of_figures == 'rnbqkbnrppppppppxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxPPPPPPPPRNBQKBNR':
                p.step_count = 0
                p.white_or_black = "New"
            else:
                p.step_count = Position.objects.last().step_count + 1
                if Position.objects.last().white_or_black in ("Black", "New"):
                    p.white_or_black = "White"
                else:
                    p.white_or_black = "Black"

            p.player_name= request.POST.get('name')
            p.save()
        else:
            context['error'] = 'Érvényeset lépj!'
      else:
          Position.positions_of_figures= 'rnbqkbnrppppppppxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxPPPPPPPPRNBQKBNR'




    all_positions= Position.objects.all().order_by('date_of_step').reverse()# a lépések kiíratása sorrendben, legfrissebb legfelül
    context['all_positions'] = all_positions # dictionary
    return render(request, 'Szakdolgozat_app/index.html', context) # és átadjuk
