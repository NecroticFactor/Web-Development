# Generated by Django 5.0.4 on 2024-12-08 09:27

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0016_category_alter_listing_category'),
    ]

    operations = [
        migrations.CreateModel(
            name='Watchlist',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('listing', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='watched_by', to='auctions.listing')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='watchlist', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('user', 'listing')},
            },
        ),
    ]