# Generated by Django 5.0.6 on 2024-06-12 22:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transcriber', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='mediafile',
            name='deleted',
            field=models.BooleanField(default=False),
        ),
    ]