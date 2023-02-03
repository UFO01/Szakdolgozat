from django.shortcuts import render
from django.http import HttpResponse
from .models import Position

# Create your views here.

def index(request):

    context={}

    all_positions= Position.objects.all().order_by('date_of_step').reverse()# a lépések kiíratása sorrendben, legfrissebb legfelül
    context['all_positions'] = all_positions # dictionary
    return render(request, 'Szakdolgozat_app/index.html', context) # és átadjuk
    #return HttpResponse('Hello!')