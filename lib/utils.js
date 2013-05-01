function formatNumber(x, separator) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join(".");
}

module.exports.formatNumber = formatNumber;
