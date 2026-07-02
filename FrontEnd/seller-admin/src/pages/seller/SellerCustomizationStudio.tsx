import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import {
    CheckCircle2,
    Database,
    Eye,
    ListChecks,
    Package2,
    Palette,
    Plus,
    Sparkles,
    Trash2,
    Type,
} from "lucide-react";

const API = "http://localhost:8081/api/v1/seller";

const token = localStorage.getItem("seller-token");

const axiosClient = axios.create({
    baseURL: API,
    headers: {
        Authorization: `Bearer ${token}`,
    },
});

type FieldType =

    "SELECT"

    | "CHECKBOX"

    | "TEXT";

interface CustomOption {

    id: number;

    label: string;

    extraPrice: number;

    value: string;
}

interface CustomField {

    id: number;

    name: string;

    type: FieldType;

    description: string;

    required: boolean;

    placeholder?: string;

    options: CustomOption[];
}

interface CustomizationResponse {

    productId:number;

    productName:string;

    productDescription:string;

    fields:CustomField[];
}



export default function SellerCustomizationStudio() {

    const [productId, setProductId] = useState<number>(1);

    const [loading, setLoading] = useState(false);

    const [fields, setFields] = useState<CustomField[]>([]);

    const [productName, setProductName] = useState("");

    const [productDescription, setProductDescription] = useState("");

    const loadCustomization = async () => {

        try {

            setLoading(true);

            const res = await axiosClient.get(
                `/products/${productId}/customization`
            );

            const data: CustomizationResponse = res.data;

            setProductName(data.productName);

            setProductDescription(data.productDescription);

            setFields(data.fields);

        } finally {

            setLoading(false);

        }

    };

    const addField = async () => {

        try {

            await axiosClient.post(

                `/products/${productId}/custom-fields`,

                {
                    name: "Thông tin mới",
                    type: "SELECT",
                    description: "Mô tả",
                    required: false,
                    placeholder: "",
                }

            );

            await loadCustomization(productId);

        }

        catch (err) {

            console.error(err);

        }

    };

    const updateField = async (
        fieldId: number
    ) => {

        try {

            const field =
                fields.find(f => f.id === fieldId);

            if (!field) return;

            await axiosClient.put(

                `/products/custom-fields/${fieldId}`,

                {
                    name: field.name,
                    type: field.type.toUpperCase(),
                    description: field.description,
                    required: field.required,
                    placeholder: field.placeholder,
                }

            );

        }

        catch (err) {

            console.error(err);

        }

    };

    useEffect(() => {

        if (productId) {

            loadCustomization();

        }

    }, [productId]);

    const updateFieldLocal = (
        fieldId: number,
        patch: Partial<CustomField>
    ) => {

        setFields(prev =>
            prev.map(field =>
                field.id === fieldId
                    ? { ...field, ...patch }
                    : field
            )
        );

    };

    const removeField = async (fieldId: number) => {

        try {

            await axiosClient.delete(
                `/products/custom-fields/${fieldId}`
            );

            await loadCustomization();

        } catch (err) {

            console.error(err);

        }

    };

    const addOption = async (fieldId: number) => {

        try {

            await axiosClient.post(

                `/products/custom-fields/${fieldId}/options`,

                {

                    label: "Tuỳ chọn mới",

                    value: "NEW_OPTION",

                    extraPrice: 0

                }

            );

            await loadCustomization();

        } catch (err) {

            console.error(err);

        }

    };

    const updateOptionLocal = (

        fieldId: number,

        optionId: number,

        patch: Partial<CustomOption>

    ) => {

        setFields(prev =>

            prev.map(field =>

                field.id === fieldId

                    ? {

                        ...field,

                        options: field.options.map(option =>

                            option.id === optionId

                                ? {

                                    ...option,

                                    ...patch

                                }

                                : option

                        )

                    }

                    : field

            )

        );

    };

    const updateOption = async (

        optionId: number

    ) => {

        const option = fields

            .flatMap(f => f.options)

            .find(o => o.id === optionId);

        if (!option) return;

        try {

            await axiosClient.put(

                `/products/options/${optionId}`,

                {

                    label: option.label,

                    value: option.value,

                    extraPrice: option.extraPrice

                }

            );

        }

        catch (err) {

            console.error(err);

        }

    };

    const removeOption = async (

        fieldId: number,

        optionId: number

    ) => {

        try {

            await axiosClient.delete(

                `/products/options/${optionId}`

            );

            await loadCustomization();

        }

        catch (err) {

            console.error(err);

        }

    };

    if (loading) {

        return (

            <div className="p-10">

                Đang tải cấu hình...

            </div>

        );

    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                    <div className="flex items-center gap-2 text-amber-600">
                        <Sparkles size={18} />
                        <p className="text-sm font-semibold uppercase tracking-[0.2em]">Per-product Custom Studio</p>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Cấu hình custom riêng cho từng sản phẩm</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Mỗi sản phẩm có thể có bộ thông tin custom riêng, ví dụ ngựa gỗ thì có màu sắc, nơ, khắc tên; các sản phẩm khác thì có thể không cần.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        onClick={addField}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
                    >
                        <Plus size={16} />
                        Thêm thông tin custom
                    </button>
                    <button
                        type="button"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-100"
                    >
                        <CheckCircle2 size={16} />
                        Cập nhật cấu hình
                    </button>
                </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-6">
                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Package2 size={18} className="text-amber-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Thông tin sản phẩm</h2>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="block text-sm font-medium text-gray-700">
                                Chọn sản phẩm cần cấu hình
                                <select
                                    value={productId}
                                    onChange={(e) => setProductId(Number(e.target.value))}
                                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
                                >

                                    <option value={1}>Ngựa gỗ handmade</option>

                                    <option value={2}>Đồ chơi gỗ hình thú</option>

                                    <option value={3}>Khung ảnh handmade</option>

                                </select>
                            </label>
                            <label className="block text-sm font-medium text-gray-700">
                                Tên sản phẩm
                                <input
                                    value={productName}
                                    onChange={(event) => setProductName(event.target.value)}
                                    className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
                                    placeholder="Ví dụ: Ngựa gỗ handmade"
                                />
                            </label>
                        </div>
                        <label className="mt-4 block text-sm font-medium text-gray-700">
                            Mô tả
                            <textarea
                                value={productDescription}
                                onChange={(event) => setProductDescription(event.target.value)}
                                rows={3}
                                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
                                placeholder="Mô tả ngắn về sản phẩm custom"
                            />
                        </label>
                    </section>

                    <section className="space-y-4">
                        {fields.map((field) => (
                            <div key={field.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                        {field.type === 'TEXT' ? <Type size={16} className="text-amber-600" /> : field.type === 'checkbox' ? <ListChecks size={16} className="text-amber-600" /> : <Palette size={16} className="text-amber-600" />}
                                        <h3 className="text-base font-semibold text-gray-900">{field.name}</h3>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeField(field.id)}
                                        className="rounded-lg p-2 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tên trường
                                        <input
                                            value={field.name}
                                            onChange={(e)=>

                                                updateFieldLocal(field.id,{
                                                    name:e.target.value
                                                })

                                            }

                                            onBlur={()=>

                                                updateField(field.id)

                                            }
                                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
                                        />
                                    </label>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Loại trường
                                        <select
                                            value={field.type}
                                            onChange={async (e)=>{updateFieldLocal(field.id,{type:e.target.value as FieldType});await updateField(field.id);}}
                                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
                                        >
                                            <option value="SELECT">Lựa chọn đơn</option>
                                            <option value="CHECKBOX">Tick chọn nhiều</option>
                                            <option value="TEXT">Nhập văn bản</option>
                                        </select>
                                    </label>
                                </div>

                                <label className="mt-4 block text-sm font-medium text-gray-700">
                                    Mô tả
                                    <textarea
                                        value={field.description}
                                        onChange={(e)=> updateFieldLocal(field.id,{description:e.target.value})}
                                        onBlur={()=> updateField(field.id)} rows={2}
                                        className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
                                    />
                                </label>

                                <label className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                                    <input
                                        type="checkbox"
                                        checked={field.required}
                                        onChange={async (e)=>{updateFieldLocal(field.id,{required:e.target.checked});await updateField(field.id);}}
                                        className="h-4 w-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                                    />
                                    Bắt buộc khi đặt hàng
                                </label>

                                {field.type !== 'text' && (
                                    <div className="mt-4 rounded-xl border border-gray-100 bg-gray-50 p-3">
                                        <div className="mb-3 flex items-center justify-between">
                                            <p className="text-sm font-semibold text-gray-700">Danh sách lựa chọn</p>
                                            <button
                                                type="button"
                                                onClick={() => addOption(field.id)}
                                                className="inline-flex items-center gap-1 rounded-lg border border-amber-200 px-2.5 py-1.5 text-xs font-semibold text-amber-600 transition hover:bg-amber-50"
                                            >
                                                <Plus size={14} />
                                                Thêm lựa chọn
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {field.options.map((option) => (
                                                <div key={option.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-white p-2">
                                                    <input
                                                        value={option.label}
                                                        onChange={(e)=> updateOptionLocal(field.id, option.id, {label:e.target.value})} onBlur={()=> updateOption(option.id)}
                                                        className="min-w-[120px] flex-1 rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-amber-400"
                                                        placeholder="Tên lựa chọn"
                                                    />
                                                    <input
                                                        value={option.extraPrice}
                                                        type="number"
                                                        onChange={(e)=> updateOptionLocal(field.id, option.id, {extraPrice:Number(e.target.value)})} onBlur={()=> updateOption(option.id)}
                                                        className="w-24 rounded border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-amber-400"
                                                    />
                                                    <span className="text-xs text-gray-500">đ</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeOption(field.id, option.id)}
                                                        className="rounded p-1.5 text-gray-400 transition hover:bg-rose-50 hover:text-rose-600"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {field.type === 'TEXT' && (
                                    <label className="mt-4 block text-sm font-medium text-gray-700">
                                        Placeholder
                                        <input
                                            value={field.placeholder ?? ''}
                                            onChange={(e)=> updateFieldLocal(field.id,{placeholder:e.target.value})} onBlur={()=> updateField(field.id)}
                                            className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-amber-400"
                                            placeholder="Ví dụ: Khắc tên lên sản phẩm"
                                        />
                                    </label>
                                )}
                            </div>
                        ))}
                    </section>
                </div>

                <div className="space-y-6">
                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Eye size={18} className="text-amber-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Xem trước cấu hình</h2>
                        </div>
                        <div className="space-y-3 rounded-xl border border-dashed border-amber-200 bg-amber-50/50 p-4">
                            <div>
                                <p className="text-sm font-semibold text-gray-800">{productName}</p>
                                <p className="mt-1 text-sm text-gray-600">{productDescription}</p>
                            </div>
                            {fields.map((field) => (
                                <div key={field.id} className="rounded-lg border border-white bg-white p-3">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 size={15} className="text-emerald-500" />
                                        <p className="text-sm font-semibold text-gray-800">{field.name}</p>
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">{field.description}</p>
                                    {field.type !== 'text' && field.options.length > 0 && (
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {field.options.map((option) => (
                                                <span key={option.id} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                          {option.label} (+{option.extraPrice.toLocaleString('vi-VN')}đ)
                        </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center gap-2">
                            <Database size={18} className="text-amber-600" />
                            <h2 className="text-lg font-semibold text-gray-900">Đề xuất database</h2>
                        </div>
                        <div className="space-y-3 text-sm text-gray-600">
                            <div className="rounded-lg border border-gray-200 p-3">
                                <p className="font-semibold text-gray-800">products</p>
                                <p>Mỗi sản phẩm có 1 bản ghi riêng, và có thể bật/tắt tính năng custom cho chính sản phẩm đó.</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 p-3">
                                <p className="font-semibold text-gray-800">product_custom_configs</p>
                                <p>Gắn cấu hình custom riêng cho từng sản phẩm, ví dụ sản phẩm A có màu + nơ, sản phẩm B có khắc tên.</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 p-3">
                                <p className="font-semibold text-gray-800">custom_fields</p>
                                <p>Lưu từng trường custom của 1 sản phẩm cụ thể, chẳng hạn màu sắc, nơ, khắc tên.</p>
                            </div>
                            <div className="rounded-lg border border-gray-200 p-3">
                                <p className="font-semibold text-gray-800">custom_order_items</p>
                                <p>Lưu dữ liệu khách hàng chọn cho 1 sản phẩm cụ thể khi đặt hàng.</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
