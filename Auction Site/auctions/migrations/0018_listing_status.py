# Generated by Django 5.0.4 on 2024-12-10 17:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0017_watchlist'),
    ]

    operations = [
        migrations.AddField(
            model_name='listing',
            name='status',
            field=models.CharField(choices=[('active', 'Active'), ('closed', 'Closed')], default='active', max_length=10),
        ),
    ]
