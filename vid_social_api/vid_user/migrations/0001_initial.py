# Generated by Django 4.2.7 on 2023-11-28 07:42

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='BinanceAccount',
            fields=[
                ('binance_acc_id', models.AutoField(primary_key=True, serialize=False)),
                ('binance_email_id', models.CharField(max_length=500)),
                ('binance_pay_id', models.CharField(max_length=500)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='CallSession',
            fields=[
                ('vid', models.AutoField(primary_key=True, serialize=False)),
                ('start_datetime', models.DateTimeField(auto_now_add=True)),
                ('end_datetime', models.DateTimeField(blank=True, null=True)),
                ('is_demo_call', models.BooleanField(default=False)),
                ('duration', models.TimeField(blank=True, null=True)),
                ('call_earning', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='CoinManagement',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('credit_coin', models.IntegerField()),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='Country',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=50)),
                ('code', models.CharField(max_length=50)),
                ('currency', models.CharField(max_length=50)),
            ],
        ),
        migrations.CreateModel(
            name='GiftGallery',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=50)),
                ('coin', models.IntegerField()),
                ('gift_image', models.TextField(blank=True, null=True)),
            ],
        ),
        migrations.CreateModel(
            name='PaymentRequest',
            fields=[
                ('payment_request_id', models.AutoField(primary_key=True, serialize=False)),
                ('total_amount_request', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('payment_status', models.CharField(max_length=8)),
                ('notify_payment_sent', models.BooleanField(default=False)),
                ('create_date_time', models.DateTimeField(auto_now_add=True)),
                ('receipts_image', models.TextField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='Report',
            fields=[
                ('report_id', models.AutoField(primary_key=True, serialize=False)),
                ('subject_line', models.TextField()),
                ('content', models.TextField()),
                ('create_datetime', models.DateTimeField(auto_now_add=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('first_name', models.CharField(max_length=150)),
                ('last_name', models.CharField(max_length=150)),
                ('display_name', models.CharField(max_length=150)),
                ('date_of_birth', models.DateField()),
                ('gender', models.CharField(choices=[('male', 'Male'), ('female', 'Female')], max_length=6)),
                ('email', models.CharField(max_length=150)),
                ('phone', models.CharField(blank=True, max_length=50, null=True)),
                ('role_id', models.CharField(choices=[('admin', 'Admin'), ('sponser', 'Sponser'), ('worker', 'Worker'), ('user', 'User')], max_length=7)),
                ('status', models.CharField(choices=[('offline', 'Offline'), ('online', 'Online'), ('busy', 'Busy')], default='offline', max_length=7)),
                ('password', models.TextField()),
                ('registered_date', models.DateField(blank=True, null=True)),
                ('first_call_date', models.DateField(blank=True, null=True)),
                ('total_warning', models.IntegerField(default=0)),
                ('total_earn_coin', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('profile_image', models.TextField(blank=True, null=True)),
                ('id_image', models.TextField(blank=True, null=True)),
                ('video_link', models.TextField(blank=True, null=True)),
                ('account_approval_state', models.CharField(choices=[('none', 'None'), ('waiting', 'Waiting'), ('confirmed', 'Confirmed')], default='none', max_length=10)),
                ('identity_no', models.CharField(blank=True, max_length=150, null=True)),
                ('is_mail_verified', models.BooleanField(default=False)),
                ('last_warning_datetime', models.DateTimeField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('country_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='vid_user.country')),
                ('sponser_id', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='worker_sponsors', to='vid_user.userprofile')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='Warning',
            fields=[
                ('warning_id', models.AutoField(primary_key=True, serialize=False)),
                ('reason', models.TextField(blank=True, null=True)),
                ('create_date_time', models.DateTimeField(auto_now_add=True)),
                ('is_active', models.BooleanField(default=True)),
                ('admin_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='admin_warnings', to='vid_user.userprofile')),
                ('user_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_warnings', to='vid_user.userprofile')),
            ],
        ),
        migrations.CreateModel(
            name='UserGallery',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('image', models.TextField(blank=True, null=True)),
                ('detail', models.TextField(blank=True, null=True)),
                ('datetime', models.DateTimeField(auto_now_add=True)),
                ('is_active', models.BooleanField(default=True)),
                ('user_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='vid_user.userprofile')),
            ],
        ),
        migrations.CreateModel(
            name='SponserHistory',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('start_datetime', models.DateTimeField(auto_now_add=True)),
                ('end_datetime', models.DateTimeField(blank=True, null=True)),
                ('current_status', models.CharField(choices=[('pending', 'Pending'), ('accepted', 'Accepted'), ('cancel', 'Cancel')], default='pending', max_length=8)),
                ('is_active', models.BooleanField(default=True)),
                ('sponser_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sponsored_histories', to='vid_user.userprofile')),
                ('worker_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='worked_histories', to='vid_user.userprofile')),
            ],
        ),
        migrations.CreateModel(
            name='Review',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('rating', models.IntegerField()),
                ('content', models.TextField(blank=True, null=True)),
                ('create_date', models.DateTimeField(auto_now_add=True)),
                ('is_approved', models.BooleanField(default=False)),
                ('is_active', models.BooleanField(default=True)),
                ('customer_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='customer_reviews', to='vid_user.userprofile')),
                ('worker_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='worker_reviews', to='vid_user.userprofile')),
            ],
        ),
        migrations.CreateModel(
            name='RequestCoinClaim',
            fields=[
                ('request_id', models.AutoField(primary_key=True, serialize=False)),
                ('request_date', models.DateField(auto_now_add=True)),
                ('coin_claim', models.DecimalField(decimal_places=2, max_digits=10)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('request_status', models.CharField(max_length=8)),
                ('bank_received', models.BooleanField(default=True)),
                ('transaction_id', models.TextField(blank=True, null=True)),
                ('receipts_image', models.TextField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('payment_request_id', models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, to='vid_user.paymentrequest')),
                ('sponser_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sponser_coin_claims', to='vid_user.userprofile')),
                ('worker_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='worker_coin_claims', to='vid_user.userprofile')),
            ],
        ),
        migrations.CreateModel(
            name='ReportAttachment',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('file_image', models.TextField(blank=True, null=True)),
                ('video_link', models.TextField(blank=True, null=True)),
                ('is_active', models.BooleanField(default=True)),
                ('report_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='vid_user.report')),
            ],
        ),
        migrations.AddField(
            model_name='report',
            name='sponser_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sponser_reports', to='vid_user.userprofile'),
        ),
        migrations.AddField(
            model_name='report',
            name='worker_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='worker_reports', to='vid_user.userprofile'),
        ),
        migrations.AddField(
            model_name='paymentrequest',
            name='admin_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='admin_payment_requests', to='vid_user.userprofile'),
        ),
        migrations.AddField(
            model_name='paymentrequest',
            name='sponser_binance_acc_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='vid_user.binanceaccount'),
        ),
        migrations.AddField(
            model_name='paymentrequest',
            name='sponser_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sponser_payment_requests', to='vid_user.userprofile'),
        ),
        migrations.CreateModel(
            name='GiftManagement',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('gift_name', models.TextField(blank=True, null=True)),
                ('gift_coin', models.DecimalField(decimal_places=2, default=0, max_digits=10)),
                ('is_active', models.BooleanField(default=True)),
                ('call_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='vid_user.callsession')),
            ],
        ),
        migrations.CreateModel(
            name='Favorite',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('is_active', models.BooleanField(default=True)),
                ('customer_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='customer_favorites', to='vid_user.userprofile')),
                ('worker_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='worker_favorites', to='vid_user.userprofile')),
            ],
        ),
        migrations.AddField(
            model_name='callsession',
            name='call_received_by',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='received_calls', to='vid_user.userprofile'),
        ),
        migrations.AddField(
            model_name='callsession',
            name='call_started_by',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='started_calls', to='vid_user.userprofile'),
        ),
        migrations.CreateModel(
            name='BuyCredit',
            fields=[
                ('buy_credit_id', models.AutoField(primary_key=True, serialize=False)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('coin_alloted', models.DecimalField(decimal_places=2, max_digits=10)),
                ('payment_transaction_id', models.TextField(blank=True, null=True)),
                ('create_date_time', models.DateTimeField(auto_now_add=True)),
                ('is_active', models.BooleanField(default=True)),
                ('customer_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='vid_user.userprofile')),
            ],
        ),
        migrations.AddField(
            model_name='binanceaccount',
            name='user_id',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='vid_user.userprofile'),
        ),
        migrations.CreateModel(
            name='BankAccount',
            fields=[
                ('bank_acc_id', models.AutoField(primary_key=True, serialize=False)),
                ('bank_name', models.CharField(max_length=150)),
                ('owner_name', models.CharField(max_length=150)),
                ('account_number', models.CharField(max_length=500)),
                ('account_type', models.CharField(max_length=150)),
                ('bank_code', models.CharField(max_length=150)),
                ('is_active', models.BooleanField(default=True)),
                ('currency_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='vid_user.country')),
                ('user_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='vid_user.userprofile')),
            ],
        ),
        migrations.CreateModel(
            name='AdminCoinAlloted',
            fields=[
                ('id', models.AutoField(primary_key=True, serialize=False)),
                ('give_credit', models.DecimalField(decimal_places=2, max_digits=10)),
                ('reason', models.TextField(blank=True, null=True)),
                ('create_date_time', models.DateTimeField(auto_now_add=True)),
                ('is_active', models.BooleanField(default=True)),
                ('admin_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='admin_coins_alloted', to='vid_user.userprofile')),
                ('worker_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='worker_coins_alloted', to='vid_user.userprofile')),
            ],
        ),
    ]
