<!DOCTYPE html>
<html lang="tr">

<head>
  <meta charset="UTF-8">
  <title>Lizay Pırlanta | Satış Paneli</title>
  <link rel="stylesheet" href="./vendors/login/styles.css">

</head>

<body>
  <!-- partial:index.partial.html -->
  <html lang="tr">

  <head>
    <!-- Latest compiled and minified CSS -->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css">
  </head>

  <body>
    <div id="form">
      <div class="container">
        <div class="col-lg-6 col-lg-offset-3 col-md-6 col-md-offset-3 col-md-8 col-md-offset-2">
          <div id="userform">
            <ul class="nav nav-tabs nav-justified" role="tablist">
              <li class="active"><a href="#signup" role="tab" data-toggle="tab">Kayıt Ol</a></li>
              <li><a href="#login" role="tab" data-toggle="tab">Giriş Yap</a></li>
              <li style="display:none;"><a href="#remindme" role="tab" data-toggle="tab">Şifremi Unuttum</a></li>
            </ul>
            <div class="tab-content">
              <div class="tab-pane fade active in" id="signup">
                <h2 class="text-uppercase text-center">KAYIT OL</h2>
                <form id="signup" method="POST" action="islem.php">
                  <div class="form-group">
                    <label>Firma Adı<span class="req">*</span> </label>
                    <input type="text" class="form-control" id="firma_ad" name="firma_ad" required data-validation-required-message="Firma Adınız" autocomplete="off">
                    <p class="help-block text-danger"></p>
                  </div>

                  <div class="form-group">
                    <label>Ad Soyad<span class="req"></span> </label>
                    <input type="text" class="form-control" id="kisi_ad_soyad" name="kisi_ad_soyad" data-validation-required-message="Adınız" autocomplete="off">
                    <p class="help-block text-danger"></p>
                  </div>
                  <div class="form-group">
                    <label>E-Posta<span class="req"></span> </label>
                    <input type="email" class="form-control" id="kisi_eposta" name="kisi_eposta" required data-validation-required-message="E-Postanız" autocomplete="off">
                    <p class="help-block text-danger"></p>
                  </div>
                  <div class="form-group">
                    <label>Telefon Numarası<span class="req">*</span> </label>
                    <input type="tel" class="form-control" id="kisi_tel" name="kisi_tel" maxlength="11" onkeypress="return isNumber(event)" oninput="inputValue(this)" required data-validation-required-message="Telefon numaranız" autocomplete="off">
                    <p class="help-block text-danger"></p>
                  </div>
                  <div class="form-group">
                    <label> Şifre<span class="req">*</span> </label>
                    <input type="password" class="form-control" id="password" name="kisi_password" required data-validation-required-message="Şifreniz" autocomplete="off">
                    <p class="help-block text-danger"></p>
                  </div>
                  <div class="mrgn-30-top">
                    <button type="submit" class="btn btn-larger btn-block">
                      Kayıt Ol
                    </button>
                  </div>
                </form>
              </div>
              <div class="tab-pane fade in" id="login">
                <h2 class="text-uppercase text-center"> Giriş Yap</h2>
                <form id="login" method="POST" action="islem.php">
                <div class="form-group">
                    <label>Telefon Numarası<span class="req">*</span> </label>
                    <input type="tel" class="form-control" id="kisi_tel" name="kisi_tel" maxlength="11" onkeypress="return isNumber(event)" oninput="inputValue(this)" required data-validation-required-message="Telefon numaranız" autocomplete="off">
                    <p class="help-block text-danger"></p>
                  </div>
                  <div class="form-group">
                    <label> Şifre<span class="req">*</span> </label>
                    <input type="password" class="form-control" id="password" name="kisi_password"  required data-validation-required-message="Şifrenizi giriniz." autocomplete="off">
                    <p class="help-block text-danger"></p>
                  </div>
                  <a style="float: right; color:white;" href="#remindme" role="tab" data-toggle="tab">Şifremi Unuttum</a>
                  <div class="mrgn-30-top">
                
                    <button type="submit" class="btn btn-larger btn-block">
                    Giriş Yap
                    </button>
                    
                  </div>
                </form>
              </div>
              <div class="tab-pane fade in" id="remindme">
                <h2 class="text-uppercase text-center"> Şifremi Unuttum</h2>
                <form id="remindme" method="POST" action="functions/passwordReminder.php">
                  <div class="form-group">
                    <label> E-Posta<span class="req">*</span> </label>
                    <input type="email" class="form-control" id="remind_password" name="remind_password"  required data-validation-required-message="Şifrenizi giriniz." autocomplete="off">
                    <p class="help-block text-danger"></p>
                  </div>
                  <div class="mrgn-30-top">
                
                    <button type="submit" class="btn btn-larger btn-block">
                    Şifremi Gönder
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- /.container -->
    </div>
    <script src="//code.jquery.com/jquery-1.11.3.min.js"></script>
    <!-- Latest compiled and minified JavaScript -->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
  </body>
  <!-- partial -->
  <script src="./vendors/login/script.js"></script>
<script>
      // Telefon numarasının başına 0 getiren ve 11 karakterden uzun girdiye engel olan JavaScript kodu
      function inputValue(el) {
      el.value = el.value.replace(/[0+]/, '');
      el.value = '0' + el.value;
      if (el.value.length > 11) {
        el.value = el.value.slice(0, 11);
      }
    }
    // Telefon numarasında string tipine izin vermeyen JavaScript kodu
    function isNumber(evt) {
      evt = (evt) ? evt : window.event;
      var charCode = (evt.which) ? evt.which : evt.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }
      return true;
    }
</script>
</body>

</html>
