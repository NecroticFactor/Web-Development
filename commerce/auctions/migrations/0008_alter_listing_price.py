# Generated by Django 5.0.4 on 2024-12-08 04:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0007_listing_created_at_alter_listing_price'),
    ]

    operations = [
        migrations.AlterField(
            model_name='listing',
            name='price',
            field=models.DecimalField(decimal_places=2, default=0.0, max_digits=10),
        ),
    ]
