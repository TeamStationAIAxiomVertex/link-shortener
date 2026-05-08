$(function() {
    var form = $('#ts-shortener-form');
    var outputPanel = $('#ts-output-panel');
    var output = $('#ts-short-url-output');
    var status = $('#ts-shortener-status');
    var copyButton = $('#ts-copy-short-url');
    var optionsButton = $('#show-link-options');
    $('#options').hide();
    var slide = 0;

    form.submit(function(event) {
        event.preventDefault();
        status.text('Creating short URL...');
        outputPanel.removeAttr('hidden');

        var payload = {
            url: $('#link-url').val(),
            customEnding: $('.custom-url-field').val(),
            secret: $('input[name="options"]:checked').val() === 's'
        };

        $.ajax({
            url: '/api/shorten',
            type: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            data: JSON.stringify(payload)
        }).done(function(response) {
            output.val(response.shortUrl);
            status.text('Short URL ready.');
            output.focus().select();
        }).fail(function(jqXHR) {
            var response = jqXHR.responseJSON || {};
            output.val('');
            status.text(response.error || 'Unable to create short URL.');
        });
    });

    copyButton.click(function() {
        var value = output.val();
        if (!value) {
            status.text('Create a short URL first.');
            return;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(value).then(function() {
                status.text('Copied to clipboard.');
            }, function() {
                output.focus().select();
                status.text('Select and copy the short URL.');
            });
            return;
        }

        output.focus().select();
        document.execCommand('copy');
        status.text('Copied to clipboard.');
    });

    optionsButton.click(function(event) {
        event.preventDefault();
        if (slide === 0) {
            $("#options").slideDown();
            slide = 1;
        } else {
            $("#options").slideUp();
            slide = 0;
        }
    });
    $('#check-link-availability').click(function(event) {
        event.preventDefault();
        var custom_link = $('.custom-url-field').val();
        var request = $.ajax({
            url: "/api/v2/link_avail_check",
            type: "POST",
            data: {
                link_ending: custom_link
            },
            dataType: "html"
        });
        $('#link-availability-status').html('<span><i class="fa fa-spinner"></i> Loading</span>');
        request.done(function(msg) {
            if (msg == 'unavailable') {
                $('#link-availability-status').html(' <span style="color:red"><i class="fa fa-ban"></i> Already in use</span>');
            } else if (msg == 'available') {
                $('#link-availability-status').html('<span style="color:green"><i class="fa fa-check"></i> Available</span>');
            } else if (msg == 'invalid') {
                $('#link-availability-status').html('<span style="color:orange"><i class="fa fa-exclamation-triangle"></i> Invalid Custom URL Ending</span>');
            } else {
                $('#link-availability-status').html(' <span style="color:red"><i class="fa fa-exclamation-circle"></i> An error occurred. Try again</span>' + msg);
            }
        });

        request.fail(function(jqXHR, textStatus) {
            $('#link-availability-status').html(' <span style="color:red"><i class="fa fa-exclamation-circle"></i> An error occurred. Try again</span>' + textStatus);
        });
    });
});

$(function() {
    // Setup drop down menu
    $('.dropdown-toggle').dropdown();

    // Fix input element click problem
    $('.dropdown input, .dropdown label').click(function(e) {
        e.stopPropagation();
    });
    $('.btn-toggle').click(function() {
        $(this).find('.btn').toggleClass('active');

        if ($(this).find('.btn-primary').size() > 0) {
            $(this).find('.btn').toggleClass('btn-primary');
        }
        if ($(this).find('.btn-danger').size() > 0) {
            $(this).find('.btn').toggleClass('btn-danger');
        }
        if ($(this).find('.btn-success').size() > 0) {
            $(this).find('.btn').toggleClass('btn-success');
        }
        if ($(this).find('.btn-info').size() > 0) {
            $(this).find('.btn').toggleClass('btn-info');
        }

        $(this).find('.btn').toggleClass('btn-default');

    });
});
