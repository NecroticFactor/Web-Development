# Generated by Django 5.0.4 on 2024-12-08 07:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0010_alter_listing_category'),
    ]

    operations = [
        migrations.AlterField(
            model_name='listing',
            name='category',
            field=models.CharField(max_length=20),
        ),
        migrations.DeleteModel(
            name='Category',
        ),
    ]