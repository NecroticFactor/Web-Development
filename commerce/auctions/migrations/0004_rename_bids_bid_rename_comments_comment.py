# Generated by Django 5.0.4 on 2024-12-07 09:00

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0003_remove_listing_bid_bids_comments'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Bids',
            new_name='Bid',
        ),
        migrations.RenameModel(
            old_name='Comments',
            new_name='Comment',
        ),
    ]
