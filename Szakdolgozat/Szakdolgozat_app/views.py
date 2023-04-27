from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponse, JsonResponse
from .models import Position


# Create your views here.

def index(request):
    context = {}

    if request.method == 'POST':
        if len(Position.objects.all()) >= 1:

#ha != helyett `is not`-ot írunk, akkor érvényesnek veszi a lépést, de nem lépi meg (de a lépésszámot növeli)
            if request.POST.get('positions') != Position.objects.last().positions_of_figures: #ha a mostani pozi NEM ugyanaz, mint a legutóbb elmentett felállás
                # nem íródik felül a request?
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

                p.player_name = request.POST.get('name')
                p.save()
            else:
                print('Position.objects.last().positions_of_figures felépítve:')
                print(Position)
                print('-------------')
                print(Position.objects)
                print('-------------')
                print(Position.objects.last())
                print('-------------')
                print(Position.objects.last().positions_of_figures)
                print('*-'*50)
                print('És ugyanígy a request.POST.get(\'positions\') felépítve:')
                print(request)
                print('-------------')
                print(request.POST)
                print('-------------')
                print(request.POST.get('positions'))
                print('-------------')
                context['error'] = 'Még nem léptél! (nézz rá a terminálra extra infókért)' #valamiért mindig lefut ez az ág
        else:
            Position.positions_of_figures = 'rnbqkbnrppppppppxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxPPPPPPPPRNBQKBNR'

    all_positions = Position.objects.all().order_by(
        'date_of_step').reverse()  # a lépések kiíratása sorrendben, legfrissebb legfelül
    context['all_positions'] = all_positions  # dictionary
    return render(request, 'Szakdolgozat_app/index.html', context)  # és átadjuk


def load(request, pk):
    p = get_object_or_404(Position, pk=pk)  # régi elem
    p.pk = None  # új elem, automatikusan kap új kulcsot
    p.save()  # elmentjük az új verziót
    return redirect('index')


def api(request):
    print(request.GET)
    data = {"reload": str(Position.objects.last().pk) != request.GET.get('pk')}
    return JsonResponse(data)
